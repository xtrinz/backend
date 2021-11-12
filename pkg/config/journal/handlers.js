const { ObjectId } = require('mongodb')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db]
    , event        =
    {
          Refund   : require('../../infra/paytm/refund')
        , Payment  : require('../../infra/paytm/payment')    
    }
    , paytm        = require('../../infra/paytm/driver')
    , tally        = require('../../system/tally')
    , Tool         = require('../../tools/export')

const Context = async function(data)
{

    let query_ =
    {
        $and : [
          { 'Buyer.ID' : data.User._id },
        , {
            Payment : 
            { 
                  $exists   : true
                , Status : { $ne : { $or: [ Model.states.Success, Model.states.ToBeCollected ] } } 
            }
          }
        ]
    }

    let ctxt = await db.journal.Get(query_)
    if(!ctxt)
    {
        console.log('no-previous-context-framing-new', { Query : query_ })
        ctxt = 
        { 
              _id     : new ObjectId()
            , IsRetry : false
            , Trial   : {}
        }
    }
    else
    {
        console.log('previous-context-found-reframing', { Previous : ctxt })
        ctxt = 
        { 
              _id     : ctxt._id
            , IsRetry : true
            , Trial   : ctxt.Payment    // History
        }
    }

    let date_    = new Date()

    ctxt.Date    = date_.toISOString()
    ctxt.Buyer   = {}
    ctxt.Store   = {}
    ctxt.Order   = {}
    ctxt.Bill    = {}
    ctxt.Refund  = {}
    ctxt.Payment = {}
    ctxt.Transit =
    {
          ID     : new ObjectId()
        , Status : Model.states.Pending
    }
    ctxt.Agent   = {}                   // Not yet set
    ctxt.Admin   = {}                   // Not yet set

    return ctxt
}

const Client     = async function (data)
{

    const addr   = await db.address.Read(data.User._id, data.AddressID)

    const client =
    {
          ID       : data.User._id
        , Name     : data.User.Name
        , MobileNo : data.User.MobileNo
        , Address  : addr
    }

    delete addr.IsDefault
    delete addr.Tag

    console.log('the-client', { Client : client })
    return client
}

const Store = async function(order)
{
    let in_ =
    {
        ID    : order.StoreID
      , Mode  : Model.mode.User
      , Store : {}
    }

    let out    = await store.Get(in_)

    if(out.Status == Model.states.Closed)
    {
        console.log('store-closed', { Store : out })
        Err_(Model.code.BAD_REQUEST, Model.reason.StoreClosed)
    }

    let store =
    {
          ID       : out.SotreID
        , Name     : out.Name
        , MobileNo : out.MobileNo
        , Address  : out.Address
    }

    console.log('the-store', { Store : store })
    return store
}

const Order = async function(client)
{

    let cart = await db.cart.Get(client.ID, query.ByUserID)

    if (!cart) 
    {
        console.log('no-cart-found-for-user', { UserID : client.ID })
        Err_(code.BAD_REQUEST, reason.CartNotFound)
    }

    if(!cart.Products.length)
    {
        console.log('no-items-in-cart', { User : client })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.NoProductsFound)
    }    

    let order_ = 
    {
          Products : []
        , StoreID  : ''
        , HasCOD   : true
    }

    for (let i = 0; i < cart.Products.length; i++)
    {

        const item    = cart.Products[i]
            , product = await db.product.Get(item.ProductID, query.ByID)

        if (!product) 
        {
            console.log('no-product-found-for-cart-item', { CartItem : item })
            db.cart.Remove(client.ID, item.ProductID) // TODO find better solution
            Err_(code.BAD_REQUEST, reason.ProductNotFound)
        }
        if (item.Quantity > product.Quantity || !product.IsAvailable)
        { 
            console.log('items-flagged', { User : client.ID })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.CartFlagged)                
        }
        if(!product.HasCOD) order_.HasCOD = false

        const node =
        {
              ProductID  : item.ProductID   , Name       : product.Name    
            , Price      : product.Price    , Image      : product.Image
            , Category   : product.Categor  , Quantity   : item.Quantity
            , Available  : product.Quantity , Flagged    : false
        }
        order_.Products.push(node)
        order_.StoreID = product.StoreID
    }

    console.log('the-order', { Order : order_ })
    return order_
}

const Paytm = async function(retry, bill, history)
{
    let txn_i, time, date = new Date()
    // On retry, if amnt is same and token 
    // has not expired, use the same token
    if( retry && bill.Total.cmp(history.Amount)   &&
        date.diff_in(     history.Time.Token
                        , Model.paytm.TokenExpiry ))
    {
        txn_i =
        {
              ID     : history.OrderID
            , Token  : history.Token
            , Amount : history.Amount
            , MID    : process.env.PAYTM_MID
            , CB     : process.env.PAYTM_CB
        }
        time  = history.Time.Token
    }
    else
    {
        txn_i  = await paytm.CreateToken(j_id, price, user)
        time   = date.toISOString()
    }
    const payment_ =
    {
          Channel : Model.channel.Paytm
        , OrderID : txn_i.ID                // Native
        , Token   : txn_i.Token
        , RefID   : ''                      // Paytm
        , Amount  : txn_i.Amount
        , Status  : Model.states.TokenGenerated
        , Time    : { Token : time, Webhook : '' }
    }
    const ret_ =
    {
          Payment : payment_
        , Txn     : txn_i
        , Trial   : {}
    }
    console.log('paytm-gateway-context', { Details : ret_ })
    return ret_
}


const COD = async function(order, bill, retry, history)
{
    let time, date = new Date()

    if(!order.HasCOD)
    {
        console.log('cod-not-allowed', { Order : order })
        Model.Err_(Model.code.CONFLICT, Model.reason.HasItemsWithNoCOD)
    }

    let time       = date.toISOString()
    const payment_ =
    {
          Channel : Model.channel.COD
        , OrderID : history.OrderID
        , Token   : ''
        , RefID   : ''
        , Amount  : bill.Total.toString()
        , Status  : Model.states.ToBeCollected
        , Time    : { Token: time, Webhook: '' }
    }
    const ret_ =
    {
          Payment : payment_
        , Trail   : retry ? history: {}
    }

    console.log('cod-context', { Details : ret_ })
    return ret_
}

const Payment = async function(client, store, order, cod, retry, history)
{
    const cords = 
    {
          Src  : { Latitude  :  store.Address.Latitude, Longitude :  store.Address.Longitude }
        , Dest : { Latitude  : client.Address.Latitude, Longitude : client.Address.Longitude }
    }
    let bill = await tally.Bill(order, cords)

    let ctxt_, path_
    if(cod) 
    {
        ctxt_ = await COD(client, store, order, bill)
        path_ = Model.channel.COD
    }
    else
    {
        ctxt_ = await Paytm(retry, bill, history)
        path_ = Model.channel.Paytm
    }
    const ret_ =
    {
          Frame : ctxt_
        , Path  : path_
        , Bill  : bill
    }
    console.log('the-payment', { Details : ret_ })
    return ret_
}

const Create    = async function(journal, data)
{
    let journal   = await Context (data)

      , client    = await Client  (data)
      , order     = await Order   (client)
      , store     = await Store   (order)
      , payment   = await Payment (   client, store, order
                                    , data.IsCOD
                                    , journal.IsRetry
                                    , journal.Trail)

    journal.Buyer   = client
    journal.Order   = order
    journal.Store   = store
    journal.Bill    = payment.Bill
    journal.Payment = payment.Frame.Payment
    journal.Trial   = payment.Frame.Trail

    let ret = {}
    if (payment.Path == Model.channel.Paytm)
    {     ret = payment.Frame.Txn          }
    else 
    {
        console.log('cod-context', { Details : payment.Frame })
        await (new Cart()).Flush(client.ID)
        journal.Transit.Status = Model.states.Running
        journal.Transit.State  = Model.states.Initiated
    }

    await db.journal.Save(journal)

    console.log('the-checkout', { Return : ret, Journal : journal })
    return ret
}

const MarkPayment = async function(req)
{
    console.log('mark-payment-status', { Body: req.body })

    const ind = new event.Payment(req.body)

    await ind.CheckSign(req.body)

    let j_rcd  = await ind.Authorize(req.body)
    
    await ind.Store(j_rcd)

    console.log('payment-status-marked', { Journal : j_rcd })
    return j_rcd
}

const MarkRefund = async function(req)
{
    console.log('mark-refund-status', { Body: req.body })

    const ind = new event.Refund(req.body, req.head.signature)

    await ind.CheckSign(req.body)
    
    let j_rcd = await ind.Authorize(req.body)

    await ind.Store(j_rcd)

    console.log('refund-status-marked', { Journal : j_rcd })
    return t_id
}

const Refund = async function(journal, refuntAmount)
{
    console.log('init-refund', { Journal : journal })

    const date = new Date(), time = date.toISOString()
    // TODO add agent info, if terminated by admin/store
    const refunt_     =
    {
          JournalID    : journal._id
        , ChannelRefID : journal.Payment.ChannelRefID
        , Amount       : refuntAmount
    }

    const txn_i     = await paytm.Refund(refunt_)
    journal.Refund  =
    {
          RefundID  : txn_i.ID
        , RefID     : txn_i.TxnID
        , Amount    : txn_i.Amount
        , Status    : txn_i.State
        , Time      : { Token : time, Webhook : '' }
    }
    console.log('refund-initiated', { Refund : journal.Refund })
}

const Payout = async function (ctxt)
{
    let journal = await db.journal.GetByID(ctxt.JournalID)
    if (!journal)
    {
        console.log('journal-not-found', { JournalID : ctxt.JournalID })
        Model.Err_(Model.code.NOT_FOUND, Model.reason.NoJournal)
    }

    const state =
    {
          Current   : ctxt.State
        , Previous  : ctxt.Return
    }
    await tally.Settle(journal, state)
    
    journal.Agent =
    {
          ID       : ctxt.Agent._id
        , Name     : ctxt.Agent.Name
        , MobileNo : ctxt.Agent.MobileNo
    }
    journal.Transit.Status = Model.states.Closed
    journal.Transit.State  = ctxt.State

    await db.journal.Save(journal)

    const refuntAmount = journal.Account.Out.Dynamic.Refund.Buyer
    if (refuntAmount > 0) { await Refund(journal, refuntAmount) }
}

const Read = async function(data, in_, mode_)
{
    console.log('read-journal', { Input: data, Client: in_ })

    let query_, proj, data_

    query_ = Tool.filter[Model.verb.view][mode_](data, in_)

    proj   = { projection : Tool.project[Model.verb.view][mode_] }

    data_  = await db.journal.Get(query_, proj)

    Tool.rinse[Model.verb.view][mode_](data_)

    return data_
}

const List = async function(data, in_, mode_)
{
    console.log('list-journal', { Input: data, Client: in_ })

    let query_, proj, data_, cond_

    query_ =  Tool.filter[Model.verb.list][mode_](data, in_)

    cond_  = { Page : data.Page.loc(), Limit : data.Limit.loc() }

    proj   = { projection : Tool.project[Model.verb.view][mode_] }

    data_  = await db.journal.GetMany(query_, proj, cond_)

    Tool.rinse[Model.verb.list][mode_](data_)

    return data_
}

module.exports = 
{
      Create    
    , MarkPayment
    , MarkRefund
    , Payout    
    , Read
    , List
    , Refund
}

