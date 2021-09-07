const { ObjectID, ObjectId } = require('mongodb')
    , db           =
    {
        cart       : require('../cart/archive')
      , user       : require('../user/archive')
      , store      : require('../store/archive')
      , journal    : require('../journal/archive')
      , addr       : require('../address/archive')
    }
    , { Err_
      , code
      , reason
      , states
      , channel
      , query
      , mode }     = require('../../system/models')
    , { Refund }   = require('../../infra/paytm/ind/refund')
    , { Payment }  = require('../../infra/paytm/ind/payment')
    , { PayTM }    = require('../../infra/paytm/driver')
    , { Store }    = require('../../config/store/driver')
    , tally        = require('../../system/tally')

function Journal()
{
    this.Data =
    {
        _id               : ''
      , Date              : ''
      
      , Buyer             :
      {
          ID              : ''
        , Name            : ''
        , Longitude       : 0
        , Latitude        : 0
        , Address         : {}
      }
      , Seller            :
      {
          ID              : ''
        , Name            : ''
        , Longitude       : 0
        , Latitude        : 0
        , Address         : {}
      }
      , Agent             :
      {
          ID              : ''
        , Name            : ''
        , MobileNo        : ''
      }
      , Agents            : [] // { ID: , Earnings: { FirstMile | SecondMile | Penalty | ReasonForPenalty |  }}
      , Order             :
      {
          Products        : [] // ProductID, Name, Price, Image, CategoryID, Quantity, Available, Flagged 
        , Bill            : 
        {
            Total         : 0
          , TransitCost   : 0
          , Tax           : 0
          , NetPrice      : 0
        }
      }
      , Payment           :
      {
          Channel         : channel.Paytm
        , TransactionID   : ''
        , ChannelParams   : {}
        , Amount          : ''
        , Status          : states.Initiated
        , TimeStamp       : ''      // Webhook entry time
      }
      , Transit           : 
      {
          ID              : ''
        , ClosingState    : ''
        , Status          : states.Running
      }
    }

    this.SetBuyer = async function(user, addr_id)
    {      
      const addr = await db.addr.Read(user._id, addr_id)
      this.Data.Buyer     = 
      {                 
          ID        : user._id
        , Name      : user.Name
        , MobileNo  : user.MobileNo
        , Longitude : addr.Longitude.loc()
        , Latitude  : addr.Latitude.loc()
        , Address   : addr.Address
      }
    }

    this.SetSeller = async function(store_id)
    {
      const store   = await db.store.Get(store_id, query.ByID)
      if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)
      this.Data.Seller    = 
      {                 
          ID        : store._id
        , Name      : store.Name
        , MobileNo  : store.MobileNo
        , Image     : store.Image
        , Longitude : store.Location.coordinates[0]
        , Latitude  : store.Location.coordinates[1]
        , Address   : store.Address
      }
    }

    this.SetOrder = async function(user_id, dest)
    {
      const items = await db.cart.Read(user_id)

      if(!items.Products.length)
      Err_(code.BAD_REQUEST, reason.NoProductsFound)

      if(items.Flagged)
      Err_(code.BAD_REQUEST, reason.CartFlagged)

      if(items.JournalID)
      this.Data._id = items.JournalID

      this.Data.Order    =
      {
          Products      : items.Products //{ProductID,Name,Price,Image,CategoryID,Quantity,Available,Flagged}
        , JournalID     : items.JournalID
        , StoreID       : items.StoreID               
      }
 
      const src_loc  = await (new Store()).GetLoc(items.StoreID)
          , dest_loc =
          {
              Lattitude : dest.Lattitude
            , Longitude : dest.Longitude
          }

      await tally.SetBill(this.Data.Order, src_loc, dest_loc)

      delete this.Data.Address

      return items.StoreID
    }

    this.SetPayment = async function(j_id, price, user)
    {
        const paytm_      = new PayTM()
            , txn_i       = await paytm_.CreateToken(j_id, price, user)
        this.Data.Payment =
        {
            Channel       : channel.Paytm
          , TransactionID : txn_i.ID
          , ChannelRefID  : ''
          , Amount        : txn_i.Amount
          , Status        : states.TokenGenerated
          , TimeStamp     : ''      // Webhook entry time
        }
        return txn_i
    }

    this.New    = async function(data)
    {
      // Set Buyer
      await this.SetBuyer(data.User, data.AddressID)

      // Set Order
      let store_id = await this.SetOrder(data.User._id, this.Data.Buyer)

      // Set Seller
      await this.SetSeller(store_id)

      // Set ID & Date
      this.Data._id  = (this.Data._id) ? this.Data._id  : new ObjectID()
      this.Data.Date = Date.now()

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
      this.Data.Transit.Status        = states.Closed
      this.Data.Transit.ClosingState  = ctxt.Data.State
      await db.journal.Save(this.Data)
    }

    this.Read = async function(data, in_, mode_)
    {
      console.log('read-journal', { Input: data, Client: in_ })
      let query_, proj, penalty, income
      switch(mode_)
      {
        case mode.User :

              query_ =
              { 
                  _id        : ObjectId(data.JournalID)
                , 'Buyer.ID' : ObjectId(in_._id)
              }
              , proj  = 
              {
                projection : 
                {
                     _id                   : 1  , 'Date'              : 1  
                  , 'Buyer.Address'        : 1
                  , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
                  , 'Seller.ID'            : 1  , 'Seller.Name'       : 1
                  , 'Seller.Address'       : 1  , 'Seller.Image'      : 1
                  , 'Order.Products'       : 1  , 'Order.Bill'        : 1
                  , 'Payment.Channel'      : 1  , 'Payment.Amount'    : 1
                  , 'Payment.Status'       : 1  , 'Payment.TimeStamp' : 1
                  , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
                  , 'Transit.ClosingState' : 1
                }
              }
              , data_ = await db.journal.Get(query_, proj)

          delete data_._id
          data_.JournalID = data.JournalID

          return data_
          case mode.Agent :

                query_ =
                { 
                    _id        : ObjectId(data.JournalID)
                  , 'Agent.ID' : ObjectId(in_._id)
                }
                proj  = 
                {
                  projection : 
                  {
                       _id                   : 1  , 'Date'              : 1

                    , 'Seller.Name'          : 1
                    , 'Seller.Address'       : 1  , 'Seller.Image'      : 1
                    , 'Seller.Longitude'     : 1  , 'Seller.Latitude'   : 1

                    , 'Buyer.Name'           : 1
                    , 'Buyer.Address'        : 1
                    , 'Buyer.Longitude'      : 1  , 'Buyer.Latitude'    : 1

                    , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
                    , 'Transit.ClosingState' : 1

                    , 'Account.In.Static.Penalty.Agent' : 1
                    , 'Account.Out.Static.Payout.Agent' : 1
                  }
                }
                data_ = await db.journal.Get(query_, proj)

            delete data_._id
            data_.JournalID = data.JournalID
            penalty   = data_.Account.In.Static.Penalty.Agent
            income    = data_.Account.Out.Static.Payout.Agent

            delete data_.Account
            data_.Penalty = penalty
            data_.Income  = income

            data_.Buyer.Longitude   = data_.Buyer.Longitude.toFixed(5)
            data_.Buyer.Latitude    = data_.Buyer.Latitude.toFixed(5)
            data_.Seller.Longitude  = data_.Seller.Longitude.toFixed(5)
            data_.Seller.Latitude   = data_.Seller.Latitude.toFixed(5)
            return data_

            case mode.Store :
              
              let store = await db.store.Get(in_._id, query.ByID)
              if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)

              query_ =
              {
                  _id         : ObjectId(data.JournalID)
                , 'Seller.ID' : ObjectId(in_._id)
              }
              proj  = 
              {
                projection : 
                {
                     _id                   : 1  , 'Date'              : 1
                  , 'Buyer.Name'           : 1
                  , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
                  , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
                  , 'Transit.ClosingState' : 1
                  , 'Order.Products'       : 1  , 'Order.Bill.Total'  : 1
                  , 'Account.In.Static.Penalty.Store' : 1
                  , 'Account.Out.Static.Payout.Store' : 1
                }
              }
              data_ = await db.journal.Get(query_, proj)

          delete data_._id
          data_.JournalID = data.JournalID
          penalty   = data_.Account.In.Static.Penalty.Store
          income    = data_.Account.Out.Static.Payout.Store

          delete data_.Account
          data_.Penalty = penalty
          data_.Income  = income
          return data_

          case mode.Admin :
            query_ =
            {
                _id         : ObjectId(data.JournalID)
            }
            proj  = 
            {
              projection : 
              {
                   _id                   : 1  , 'Date'            : 1
                
                , 'Buyer.Name'           : 1
                , 'Buyer.Address'        : 1
                , 'Buyer.Longitude'      : 1  , 'Buyer.Latitude'  : 1

                , 'Seller.ID'            : 1  , 'Seller.Name'     : 1
                , 'Seller.Address'       : 1  , 'Seller.Image'    : 1
                , 'Seller.Longitude'     : 1  , 'Seller.Latitude' : 1
                
                , 'Agent.Name'           : 1  , 'Agent.MobileNo'  : 1

                , 'Payment.Channel'      : 1  , 'Payment.Amount'    : 1
                , 'Payment.Status'       : 1  , 'Payment.TimeStamp' : 1

                , 'Transit.ID'           : 1  , 'Transit.Status'  : 1
                , 'Transit.ClosingState' : 1

                , 'Order.Products'       : 1  , 'Order.Bill'      : 1
                , 'Account.In.Static.Penalty'        : 1
                , 'Account.Out.Dynamic.Refund.Buyer' : 1
              }
            }
            data_ = await db.journal.Get(query_, proj)

        delete data_._id
        data_.JournalID = data.JournalID
        penalty   = data_.Account.In.Static.Penalty
        income    = data_.Account.Out.Dynamic.Refund.Buyer

        delete data_.Account
        data_.Penalty   = penalty
        data_.Refund    = income

        data_.Buyer.Longitude   = data_.Buyer.Longitude.toFixed(5)
        data_.Buyer.Latitude    = data_.Buyer.Latitude.toFixed(5)
        data_.Seller.Longitude  = data_.Seller.Longitude.toFixed(5)
        data_.Seller.Latitude   = data_.Seller.Latitude.toFixed(5)
        
        return data_

      }
    }

    this.List = async function(data, in_, mode_)
    {
      console.log('list-journal', { Input: data, Client: in_ })
      let query_, proj, penalty, income, data_, cond_
      switch(mode_)
      {
        case mode.User :

          query_ =
          { 
            'Buyer.ID' : ObjectId(in_._id)
          }
          proj   = 
          {
            projection : 
            {
                  _id                   : 1  , 'Date'              : 1  
              , 'Buyer.Address'        : 1
              , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
              , 'Seller.ID'            : 1  , 'Seller.Name'       : 1
              , 'Seller.Address'       : 1  , 'Seller.Image'      : 1
              , 'Order.Products'       : 1  , 'Order.Bill'        : 1
              , 'Payment.Channel'      : 1  , 'Payment.Amount'    : 1
              , 'Payment.Status'       : 1  , 'Payment.TimeStamp' : 1
              , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
              , 'Transit.ClosingState' : 1
            }
          }
          cond_   =
          {
              Page  : data.Page.loc()
            , Limit : data.Limit.loc()
          }          
          data_   = await db.journal.GetMany(query_, proj, cond_)

          for(let idx = 0; idx < data_.length; idx++)
          {
            data_[idx].JournalID = data_[idx]._id
            delete data_[idx]._id
          }
          return data_

        case mode.Agent :

          query_ =
          {
            'Agent.ID' : ObjectId(in_._id)
          }
          proj  = 
          {
            projection : 
            {
                  _id                   : 1  , 'Date'              : 1

              , 'Seller.Name'          : 1
              , 'Seller.Address'       : 1  , 'Seller.Image'      : 1
              , 'Seller.Longitude'     : 1  , 'Seller.Latitude'   : 1

              , 'Buyer.Name'           : 1
              , 'Buyer.Address'        : 1
              , 'Buyer.Longitude'      : 1  , 'Buyer.Latitude'    : 1

              , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
              , 'Transit.ClosingState' : 1

              , 'Account.In.Static.Penalty.Agent' : 1
              , 'Account.Out.Static.Payout.Agent' : 1
            }
          }
          cond_   =
          {
              Page  : data.Page.loc()
            , Limit : data.Limit.loc()
          }          
          data_ = await db.journal.GetMany(query_, proj, cond_)

          for(let idx = 0; idx < data_.length; idx++)
          {
            data_[idx].JournalID = data_[idx]._id
            delete data_[idx]._id
            penalty   = data_[idx].Account.In.Static.Penalty.Agent
            income    = data_[idx].Account.Out.Static.Payout.Agent

            delete data_[idx].Account
            data_[idx].Penalty = penalty
            data_[idx].Income  = income

            data_[idx].Buyer.Longitude  = data_[idx].Buyer.Longitude.toFixed(5)
            data_[idx].Buyer.Latitude   = data_[idx].Buyer.Latitude.toFixed(5)
            data_[idx].Seller.Longitude = data_[idx].Seller.Longitude.toFixed(5)
            data_[idx].Seller.Latitude  = data_[idx].Seller.Latitude.toFixed(5)                  
          }
          return data_

        case mode.Store :
          
          let store = await db.store.Get(in_._id, query.ByID)
          if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)

          query_ =
          {
            'Seller.ID' : ObjectId(in_._id)
          }
          proj  = 
          {
            projection : 
            {
                  _id                   : 1  , 'Date'              : 1
              , 'Buyer.Name'           : 1
              , 'Agent.Name'           : 1  , 'Agent.MobileNo'    : 1
              , 'Transit.ID'           : 1  , 'Transit.Status'    : 1
              , 'Transit.ClosingState' : 1
              , 'Order.Products'       : 1  , 'Order.Bill.Total'  : 1
              , 'Account.In.Static.Penalty.Store' : 1
              , 'Account.Out.Static.Payout.Store' : 1
            }
          }
          cond_   =
          {
              Page  : data.Page.loc()
            , Limit : data.Limit.loc()
          }          
          data_ = await db.journal.GetMany(query_, proj, cond_)

          for(let idx = 0; idx < data_.length; idx++)
          {
            data_[idx].JournalID = data_[idx]._id
            delete data_[idx]._id
            penalty   = data_[idx].Account.In.Static.Penalty.Store
            income    = data_[idx].Account.Out.Static.Payout.Store
  
            delete data_[idx].Account
            data_[idx].Penalty = penalty
            data_[idx].Income  = income 
          }
            return data_

        case mode.Admin :

          query_ =
          { '$or': // TODO $lookup cross transit status
            [
                {  'Admin.ID' : in_._id }
              , { 'Admins.ID' : in_._id }
            ]
          }
          proj  = 
          {
            projection : 
            {
                  _id                   : 1  , 'Date'            : 1
              
              , 'Buyer.Name'           : 1
              , 'Buyer.Address'        : 1
              , 'Buyer.Longitude'      : 1  , 'Buyer.Latitude'  : 1

              , 'Seller.ID'            : 1  , 'Seller.Name'     : 1
              , 'Seller.Address'       : 1  , 'Seller.Image'    : 1
              , 'Seller.Longitude'     : 1  , 'Seller.Latitude' : 1
              
              , 'Agent.Name'           : 1  , 'Agent.MobileNo'  : 1

              , 'Payment.Channel'      : 1  , 'Payment.Amount'    : 1
              , 'Payment.Status'       : 1  , 'Payment.TimeStamp' : 1

              , 'Transit.ID'           : 1  , 'Transit.Status'  : 1
              , 'Transit.ClosingState' : 1

              , 'Order.Products'       : 1  , 'Order.Bill'      : 1
              , 'Account.In.Static.Penalty'        : 1
              , 'Account.Out.Dynamic.Refund.Buyer' : 1
            }
          }
          cond_   =
          {
              Page  : data.Page.loc()
            , Limit : data.Limit.loc()
          }             
          data_ = await db.journal.GetMany(query_, proj, cond_)

          for(let idx = 0; idx < data_.length; idx++)
          {
              data_[idx].JournalID = data_[idx]._id
              delete data_[idx]._id
              penalty        = data_[idx].Account.In.Static.Penalty
              income         = data_[idx].Account.Out.Dynamic.Refund.Buyer
      
              delete data_[idx].Account
              data_[idx].Penalty   = penalty
              data_[idx].Refund    = income

              data_[idx].Buyer.Longitude  = data_[idx].Buyer.Longitude.toFixed(5)
              data_[idx].Buyer.Latitude   = data_[idx].Buyer.Latitude.toFixed(5)
              data_[idx].Seller.Longitude = data_[idx].Seller.Longitude.toFixed(5)
              data_[idx].Seller.Latitude  = data_[idx].Seller.Latitude.toFixed(5)    
          }
          return data_
      }
    }
}

module.exports =
{
  Journal: Journal
}