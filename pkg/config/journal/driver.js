const { ObjectID, ObjectId } = require('mongodb')
    , db           =
    {
        cart       : require('../cart/archive')
      , user       : require('../user/archive')
      , store      : require('../store/archive')
      , journal    : require('../journal/archive')
      , addr       : require('../address/archive')
    }
    , { Err_   , code
      , reason , states
      , channel, mode
      , verb}      = require('../../system/models')
    , { Refund }   = require('../../infra/paytm/ind/refund')
    , { Payment }  = require('../../infra/paytm/ind/payment')
    , { PayTM }    = require('../../infra/paytm/driver')
    , { Store }    = require('../../config/store/driver')
    , tally        = require('../../system/tally')
    , project      = require('../../tools/project/journal')
    , rinse        = require('../../tools/rinse/journal')
    , filter       = require('../../tools/filter/journal')
    , template     = require('./template')

function Journal()
{
    this.Data = template.Data

    this.SetOrder = async function(user_id, dest)
    {
      const items = await db.cart.List(user_id)

      if(!items.Products.length)
      Err_(code.BAD_REQUEST, reason.NoProductsFound)

      if(items.Flagged)
      Err_(code.BAD_REQUEST, reason.CartFlagged)

      if(items.JournalID)
      {
        this.Data.IsRetry = true
        this.Data._id = items.JournalID
      }

      this.Data.Order    =
      {
          Products      : items.Products //{ProductID,Name,Price,Image,CategoryID,Quantity,Available,Flagged}
        , JournalID     : items.JournalID
        , StoreID       : items.StoreID  
        , HasCOD        : items.HasCOD
      }
 
      const src_loc  = await (new Store()).GetLoc(items.StoreID)
          , dest_loc =
          {
              Latitude : dest.Address.Latitude
            , Longitude : dest.Address.Longitude
          }

      await tally.SetBill(this.Data.Order, src_loc, dest_loc)

      delete this.Data.Address

      return items.StoreID
    }

    this.SetPayment = async function(j_id, price, user)
    {
        let txn_i, time
        if(this.Data.IsRetry)
        {
          
          const j_rcd = await db.journal.GetByID(this.Data._id)
          
          if((price.toFixed(2).toString() === j_rcd.Payment.Amount) &&
              (Date.now() - j_rcd.Payment.TimeStamp.Token < 15 * 60 * 1000 )) // 15m is the paytm token expiry time
          {
            txn_i =
            {
                ID          : j_rcd.Payment.TransactionID
              , Token       : j_rcd.Payment.Token
              , Amount      : j_rcd.Payment.Amount
              , MID         : process.env.PAYTM_MID
              , CallBackURL : process.env.PAYTM_CB
            }
            time  = j_rcd.Payment.TimeStamp.Token
          }
          else
          {
            const paytm_ = new PayTM()
                  txn_i  = await paytm_.CreateToken(j_id, price, user)
                  time   = (new Date()).toISOString()
          }
        }
        else
        {
          const paytm_ = new PayTM()
                txn_i  = await paytm_.CreateToken(j_id, price, user)
                time   = (new Date()).toISOString()
        }
        this.Data.Payment =
        {
            Channel       : channel.Paytm
          , TransactionID : txn_i.ID
          , Token         : txn_i.Token
          , ChannelRefID  : ''
          , Amount        : txn_i.Amount
          , Status        : states.TokenGenerated
          , TimeStamp     :
          {
              Token       : time
            , Webhook     : ''
          }
        }
        return txn_i
    }

    this.New    = async function(data)
    {

      // Client Context
      this.Data.Buyer   = await db.addr.Client(data.User, data.AddressID)

      // Order Details
      let store_id = await this.SetOrder(data.User._id, this.Data.Buyer)

      // Seller Context
      this.Data.Seller  = await db.store.Seller(store_id)

      // Set ID & Date
      this.Data._id  = (this.Data._id) ? this.Data._id  : new ObjectID()
      this.Data.Date = (new Date()).toISOString()

      // Set Payment
      const details_ = await this.SetPayment(this.Data._id, 
                       this.Data.Order.Bill.NetPrice, this.Data.Buyer)

      await db.journal.Save(this.Data)

      console.log('checkout-initiated', {Data : details_ })
      return details_
    }

    this.MarkPayment = async function(req)
    {
      console.log('mark-payment-status', { Body: req.body })

      const ind = new Payment(req.body)

      await ind.CheckSign(req.body)

      let j_rcd  = await ind.Authorize(req.body)
        , t_id   = await ind.Store(j_rcd)

       this.Data = j_rcd

      console.log('payment-status-marked', { Journal : j_rcd })
      return t_id
    }

    this.MarkRefund = async function(req)
    {
      console.log('mark-refund-status', { Body: req.body })

      const ind = new Refund(req.body, req.head.signature)

      await ind.CheckSign(req.body)
      
      let j_rcd = await ind.Authorize(req.body)

      await ind.Store(j_rcd)

      console.log('refund-status-marked', { Journal : j_rcd })
      return t_id
    }

    this.SetRefund = async function(refuntAmount)
    {
      console.log('init-refund', { Journal : this.Data })
      // TODO add agent info, if terminated by admin/store
      const refunt_     =
      {
          JournalID    : this.Data._id
        , ChannelRefID : this.Data.Payment.ChannelRefID
        , Amount       : refuntAmount
      }
      const paytm_      = new PayTM()
          , txn_i       = await paytm_.Refund(refunt_)
      this.Data.Refund  =
      {
          TransactionID : txn_i.ID
        , ChannelRefID  : txn_i.TxnID
        , Amount        : txn_i.Amount
        , Status        : txn_i.State
        , TimeStamp     : ''      // Webhook entry time
      }
      console.log('refund-initiated', { Refund : this.Data.Refund })
    }

    this.PayOut = async function (ctxt)
    {
      this.Data = await db.journal.GetByID(ctxt.Data.JournalID)
      if (!this.Data) Err_(code.BAD_REQUEST, reason.JournalNotFound)

      const state =
      {
          Current   : ctxt.Data.State
        , Previous  : ctxt.Data.Return
      }
      await tally.SettleAccounts(this.Data, state)
      
      const refuntAmount = this.Data.Account.Out.Dynamic.Refund.Buyer
        if (refuntAmount > 0)
        this.SetRefund(refuntAmount)

      this.Data.Agent =
      {
            ID        : ctxt.Data.Agent._id
          , Name      : ctxt.Data.Agent.Name
          , MobileNo  : ctxt.Data.Agent.MobileNo
      }
      this.Data.Transit.Status = states.Closed
      this.Data.Transit.State  = ctxt.Data.State
      await db.journal.Save(this.Data)
    }

    this.Read = async function(data, in_, mode_)
    {
      console.log('read-journal', { Input: data, Client: in_ })
      let query_, proj, data_
      switch(mode_)
      {
        case mode.User :

          query_ =
          { 
              _id        : ObjectId(data.JournalID)
            , 'Buyer.ID' : ObjectId(in_._id)
          }
          break

        case mode.Agent :

          query_ = { 'Agent.ID' : ObjectId(in_._id) }

          if(data.JournalID) query_._id = ObjectId(data.JournalID)
          if((data.IsLive !== undefined) && (data.IsLive == true))
          {
            query_[ 'Transit.Status' ] = states.Running
          }
          break

        case mode.Store :

          query_ =
          {
              _id         : ObjectId(data.JournalID)
            , 'Seller.ID' : ObjectId(in_._id)
          }
          break

        case mode.Admin :

          query_ =
          {
              _id         : ObjectId(data.JournalID)
          }        
          break
      }

      proj  = { projection : project[verb.view][mode_] }
      data_ = await db.journal.Get(query_, proj)

      rinse[verb.view][mode_](data_)

      return data_
    }

    this.List = async function(data, in_, mode_)
    {
      console.log('list-journal', { Input: data, Client: in_ })
      let query_, proj, data_, cond_

      query_ =  filter[verb.list][mode_](in_)

      if((data.IsLive !== undefined) && (data.IsLive == true))
      query_[ 'Transit.Status' ] = states.Running
      else if (data.IsLive !== undefined)
      query_[ 'Transit.Status' ] = states.Closed

      cond_   =
      {
          Page  : data.Page.loc()
        , Limit : data.Limit.loc()
      }

      proj  = { projection : project[verb.view][mode_] }

      data_ = await db.journal.GetMany(query_, proj, cond_)

      rinse[verb.list][mode_](data_)

      return data_
    }
}

module.exports =
{
  Journal: Journal
}
