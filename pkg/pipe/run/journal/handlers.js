const { ObjectId } = require('mongodb')
    , Model        = require('../../../sys/models')
    , acc          = require('../../run/price/export')
    , Log          = require('../../../sys/log')
    , db           = require('../../exports')[Model.segment.db]
    , event        =
    {
          Refund   : require('../../../infra/paytm/refund')
        , Payment  : require('../../../infra/paytm/payment')    
    }
    , paytm        = require('../../../infra/paytm/driver')
    , Tool         = require('../../../tool/export')[Model.resource.journal]
    , cart         = require('../../fin/cart/driver')
    , SellerM      = require('../../role/seller/methods')


const Context = async function(data)
{
    Log('generate-context', { Data : data })

    let query_ =
    {
        $and : [ { 'Client.ID'      : data.Client._id      }
               , { 'Transit.Status' : Model.states.Pending } ]
    }

    let ctxt = await db.journal.Find(query_)
    if(!ctxt)
    {
        Log('no-previous-context-framing-new', { Query : query_ })
        ctxt = 
        { 
              _id     : new ObjectId()
            , IsRetry : false
            , Trial   : {}
        }
    }
    else
    {
        Log('previous-context-found-reframing', { Previous : ctxt })
        ctxt = 
        { 
              _id     : ctxt._id
            , IsRetry : true
            , Trial   : ctxt.Payment
        }
    }

    let date_     = new Date()

    ctxt.Time     = 
    { 
          Created : date_.toISOString()
        , Webhook : ''
        , Token   : ''
    }
    ctxt.Client   = {}
    ctxt.Seller   = {}
    ctxt.Order    = {}
    ctxt.Bill     = {}
    ctxt.Refund   = {}
    ctxt.Payment  = {}
    ctxt.Transit  =
    {
          ID      : new ObjectId()
        , Status  : Model.states.Pending
        , State   : Model.states.Pending
    }
    ctxt.Agent    = {}
    ctxt.Arbiter  = {}                   // Not yet set  

    // Set tranist and journal ctxts with 
    // equivalent filed and dirclty set it on payout

    return ctxt
}

const Client     = async function (data)
{

    const addr   = await db.address.Read(data.Client._id, data.AddressID)

    const client =
    {
          ID       : data.Client._id
        , Name     : data.Client.Name
        , MobileNo : data.Client.MobileNo
        , Address  : addr
    }

    delete addr.IsDefault
    delete addr.Tag

    Log('the-client', { Client : client })
    return client
}

const Seller = async function(order)
{
    let in_ = { ID : order.SellerID, Mode : Model.mode.System, Seller : {} }

    let out = await SellerM.Get(in_)

    if(out.Status == Model.states.Closed)
    {
        Log('seller-closed', { Seller : out })
        Err_(Model.code.BAD_REQUEST, Model.reason.SellerClosed)
    }

    let seller =
    {
          ID       : out.SellerID
        , Name     : out.Name
        , Image    : out.Image
        , MobileNo : out.MobileNo
        , Address  : out.Address
    }

    Log('the-seller', { Seller : seller })
    return seller
}

const Order = async function(client)
{

    let cart = await db.cart.Get(client.ID, Model.query.ByClientID)

    if (!cart) 
    {
        Log('no-cart-found-for-client', { ClientID : client.ID })
        Err_(code.BAD_REQUEST, reason.CartNotFound)
    }

    if(!cart.Products.length)
    {
        Log('no-items-in-cart', { Client : client })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.NoProductsFound)
    }    

    let order_ = { Products : [], SellerID : '', HasCOD   : true }

    for (let i = 0; i < cart.Products.length; i++)
    {

        const item    = cart.Products[i]
            , product = await db.product.Get(item.ProductID, Model.query.ByID)

        if (!product) 
        {
            Log('no-product-found-for-cart-item', { CartItem : item })
            db.cart.Remove(client.ID, item.ProductID) // TODO find better solution
            Err_(code.BAD_REQUEST, reason.ProductNotFound)
        }

        // Item ready
        if (item.Quantity > product.Quantity || !product.IsAvailable)
        { 
            Log('items-flagged', { Client : client.ID })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.CartFlagged)                
        }

        // Has Cod
        if(!product.HasCOD) order_.HasCOD = false

        // Make Chart
        const node =
        {
              ProductID  : item.ProductID   , Name       : product.Name    
            , Price      : product.Price    , Image      : product.Image
            , Category   : product.Category , Quantity   : item.Quantity
            , Available  : product.Quantity , Flagged    : false
        }
        order_.Products.push(node)
        order_.SellerID = product.SellerID
    }

    Log('the-order', { Order : order_ })
    return order_
}

const Paytm = async function(client, bill, journal)
{
    let txn_i, time, date = new Date()
    // On retry, if amnt is same and token 
    // has not expired, use the same token
    if( journal.IsRetry && bill.Total.cmp(journal.Trial.Amount)   &&
        date.diff_in(     journal.Trial.Time.Token
                        , Model.paytm.TokenExpiry ))
    {
        txn_i =
        {
              ID     : journal.Trial.OrderID
            , Token  : journal.Trial.Token
            , Amount : journal.Trial.Amount
            , MID    : process.env.PAYTM_MID
            , CB     : process.env.PAYTM_CB
        }
        time  = journal.Trial.Time.Token
        // Trial reused, so reset
        journal.Trial = {}
    }
    else
    {
        txn_i  = await paytm.CreateToken(journal._id, bill.Total, client)
        time   = date.toISOString()
    }
    const payment_ =
    {
          Channel : Model.channel.Paytm , OrderID : txn_i.ID                // Native
        , Token   : txn_i.Token         , RefID   : ''                      // Paytm
        , Amount  : txn_i.Amount        , Time    : { Token : time, Webhook : '' }                    
        , Status  : Model.states.TokenGenerated
    }

    const ret_     = { Payment : payment_, Txn : txn_i }

    Log('paytm-gateway-context', { Details : ret_ })
    return ret_
}


const COD = async function(order, bill, journal)
{
    let date = new Date(), time = date.toISOString()

    if(!order.HasCOD)
    {
        Log('cod-not-allowed', { Order : order })
        Model.Err_(Model.code.CONFLICT, Model.reason.HasItemsWithNoCOD)
    }

    const payment_ =
    {
          Channel : Model.channel.COD
        , OrderID : Model.paytm.Order.format(String(journal._id))
        , Token   : ''
        , RefID   : ''
        , Amount  : bill.Total.toString()
        , Status  : Model.states.ToBeCollected
        , Time    : { Token: time, Webhook: '' }
    }
    const ret_ =
    {
          Payment : payment_
        , Trial   : journal.IsRetry ? journal.Trial: {}
    }

    Log('cod-context', { Details : ret_ })
    return ret_
}

const Payment = async function(client, seller, order, journal, cod)
{
    const cords = 
    {
          Src  : { Latitude  : seller.Address.Latitude, Longitude : seller.Address.Longitude }
        , Dest : { Latitude  : client.Address.Latitude, Longitude : client.Address.Longitude }
    }
    let bill = await acc.Bill(order, cords)

    let ctxt_, path_
    if (cod) { ctxt_ = await    COD(order, bill, journal) ; path_ = Model.channel.COD   }
    else     { ctxt_ = await Paytm(client, bill, journal) ; path_ = Model.channel.Paytm }

    const ret_ = { Frame : ctxt_, Path : path_, Bill : bill }

    Log('the-payment', { Details : ret_ })

    return ret_
}


// Understand Journal Timing
const Create    = async function(data)
{
    let journal = await Context (data   )
      , client  = await Client  (data   )
      , order   = await Order   (client )
      , seller  = await Seller  (order  )
      , payment = await Payment (client, seller, order, journal, data.IsCOD)

    journal.Client      = client
    journal.Order       = order
    journal.Seller      = seller
    journal.Bill        = payment.Bill
    journal.Book        = []
    journal.Payment     = payment.Frame.Payment
    journal.Trial       = payment.Frame.Trial
    journal.Time.Token  = payment.Frame.Payment.Time.Token    

    let ret = { Journal  : journal, Response : {}   }

    if (payment.Path == Model.channel.Paytm)
    {     ret.Response = payment.Frame.Txn          }
    else 
    {
        Log('cod-context', { Details : payment.Frame })
        await cart.Flush(client.ID)
        journal.Transit.Status = Model.states.Running
        journal.Transit.State  = Model.states.Initiated
    }

    await db.journal.Save(journal)

    Log('the-checkout', { Return : ret, Journal : journal })
    return ret
}

const MarkPayment = async function(req)
{
    Log('mark-payment-status', { Body: req.body })

    const ind = new event.Payment(req.body)

    // TODO await ind.CheckSign(req.body)

    let j_rcd  = await ind.Authorize(req.body)
    
    console.log('journal-record', { Journal : j_rcd })
    await ind.Record(j_rcd)

    Log('payment-status-marked', { Journal : j_rcd })
    return j_rcd
}

const MarkRefund = async function(req)
{
    Log('mark-refund-status', { Body: req.body })

    const ind = new event.Refund(req.body, req.head.signature)

    await ind.CheckSign(req.body)
    
    let j_rcd = await ind.Authorize(req.body)

    await ind.Seller(j_rcd)

    Log('refund-status-marked', { Journal : j_rcd })
    return t_id
}

const Refund = async function(journal, refuntAmount)
{
    Log('init-refund', { Journal : journal })

    const date = new Date(), time = date.toISOString()
    // TODO add agent info, if terminated by arbiter/seller
    const refunt_     =
    {
          JournalID : journal._id
        , RefID     : journal.Payment.RefID
        , Amount    : refuntAmount
    }

    const txn_i     = await paytm.Refund(refunt_)
    journal.Refund  =
    {
          RefundID  : txn_i.ID
        , RefID     : txn_i.RefID
        , Amount    : txn_i.Amount
        , Status    : txn_i.State
        , Time      : { Token : time, Webhook : '' }
    }
    Log('refund-initiated', { Refund : journal.Refund })
}

const Payout = async function (ctxt)
{
    let journal = await db.journal.GetByID(ctxt.JournalID)
    if (!journal)
    {
        Log('journal-not-found', { JournalID : ctxt.JournalID })
        Model.Err_(Model.code.NOT_FOUND, Model.reason.NoJournal)
    }

    await acc.Settle(journal)   // Post to ledgers

    const refunt = 0 // TODO 
    if (refunt > 0) { await Refund(journal, refunt) }

    await db.journal.Save(journal)    
}

const Read = async function(data, in_, mode_)
{
    Log('read-journal', { Input: data, Client: in_ })

    let query_, proj, data_

    query_ = Tool.filter[Model.verb.view][mode_](data, in_)
    proj   = { projection : Tool.project[Model.verb.view][mode_] }

    data_  = await db.journal.Get(query_, proj)

    Tool.rinse[Model.verb.view][mode_](data_)

    return data_
}

const List = async function(data, in_, mode_)
{
    Log('list-journal', { Input: data, Client: in_ })

    let query_, proj, data_, cond_

    query_ = Tool.filter[Model.verb.list][mode_](data, in_)
    cond_  = { Page : data.Page.loc(), Limit : data.Limit.loc() }
    proj   = { projection : Tool.project[Model.verb.list][mode_] }

    data_  = await db.journal.GetMany(query_, proj, cond_)

    Tool.rinse[Model.verb.list][mode_](data_)

    return data_
}

module.exports = 
{
      MarkPayment,  MarkRefund
    , Create , Payout   , Read
    , List   , Refund
}