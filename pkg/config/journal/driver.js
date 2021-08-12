const { ObjectID } = require('mongodb')
    , db           =
    {
        cart       : require('../cart/archive')
      , user       : require('../user/archive')
      , store      : require('../store/archive')
      , journal    : require('../journal/archive')
      , addr       : require('../address/archive')
    }
    , { Err_, code, reason }     = require('../../common/error')
    , { states, channel, query, source } = require('../../common/models')
    , { Refund }   = require('../../infra/paytm/ind/refund')
    , { Payment }  = require('../../infra/paytm/ind/payment')
    , { PayTM }    = require('../../infra/paytm/driver')
    , { Store }    = require('../../config/store/driver')
    , tally        = require('../../common/tally')

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
        , Longitude : addr.Longitude
        , Latitude  : addr.Latitude
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

    this.PayOut = async function (ctxt)
    {
      this.Data = await db.journal.GetByID(ctxt.Data.JournalID)
      if (!this.Data) Err_(code.BAD_REQUEST, reason.JournalNotFound)

      switch (ctxt.Data.State)
      {
        case states.TranistCompleted :
        break
        case states.CargoCancelled   :
        break
        case states.OrderRejected    :
        break
        case states.TransitRejected  :
        break
      }
      this.Data.Transit.Status        = states.Closed
      this.Data.Transit.ClosingState  = ctxt.Data.State
      await db.journal.Save(this.Data)
    }

    this.Read = async function(data, user)
    {
      console.log('read-journal', { Input: data, UserID: user._id })
      switch(data.Origin)
      {
        case source.User :

          const query =
              { 
                  _id     : ObjectId(data.JournalID)
                , Buyer   : { ID : user._id }
              }
              , proj  = 
              {
                  _id     : 1
                , Buyer   : { Address : 1 }
                , Seller  : { ID : 1 , Name : 1, Address : 1, Image: 1 }
                , Order   : { Products : 1, Bill : 1 }
                , Payment : { Channel : 1, Amount : 1, Status: 1, TimeStamp: 1 }
                , Transit : { ID : 1 , Status : 1, ClosingState: 1 }
              }
              , data_ = await db.journal.Get(query, proj)

          delete data_._id
          data_.JournalID = data.JournalID

          return data_
      }
    }

    this.List = function(data)
    {
      switch(data.Entity)
      {
            case entity.User:
      }
    }
}

module.exports =
{
  Journal: Journal
}