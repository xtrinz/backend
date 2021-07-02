const { Cart }     = require('./cart')
    , { ObjectID } = require('mongodb')
    , test         = require('../common/test')
    , { Stripe }   = require('../infra/stripe')
    , db           =
    {
        cart       : require('../archive/cart')
      , user       : require('../archive/user')
      , store      : require('../archive/store')
      , journal    : require('../archive/journal')
    }
    , { Err_, code, reason }     = require('../common/error')
    , { states, channel, query } = require('../common/models')

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
        , Location        : {}
        , Address         : {}
      }
      , Seller            :
      {
          ID              : ''
        , Name            : ''
        , Location        : {}
        , Address         : {}
      }
      , Agents            : [] // { ID: , Earnings: { FirstMile | SecondMile | Penalty | ReasonForPenalty |  }}
      , Order             :
      {
          Products        : [] // ProductID, Name, Price, Image, Quantity
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
          Channel         : channel.Stripe
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

    this.New    = async function(data)
    {
      // Set User
      this.Data.Buyer     = 
      {                 
          ID        : data.User._id
        , Name      : data.User.Name
        , MobileNo  : data.User.MobileNo
        , Longitude : data.Longitude
        , Latitude  : data.Latitude
        , Address   : data.Address
      }

      // Set Cart
      let cart_           = new Cart()
      const cart_data     = await cart_.Read(data.User._id)

      if(!cart_data.Products.length)
      Err_(code.BAD_REQUEST, reason.NoProductsFound)

      if(cart_data.Flagged)
      Err_(code.BAD_REQUEST, reason.CartFlagged)

      if(cart_data.JournalID) { this.Data = await db.journal.GetByID(cart_data.JournalID) }

      delete cart_data.Flagged
      delete cart_data.JournalID

      this.Data.Order     = { ...cart_data }
      delete this.Data.Order.StoreID

      // Set Seller
      const store   = await db.store.Get(cart_data.StoreID, query.ByID)
      if (!store) Err_(code.BAD_REQUEST, reason.StoreNotFound)
      this.Data.Seller    = 
      {                 
          ID        : store._id
        , Name      : store.Name
        , MobileNo  : store.MobileNo
        , Longitude : store.Location.coordinates[0]
        , Latitude  : store.Location.coordinates[1]
        , Address   : store.Address
      }                 

      // Set ID & Date
      this.Data._id       = (this.Data._id) ? this.Data._id  : new ObjectID()
      this.Data.Date      = (this.Data.Date)? this.Data.Date : Date.now()

      // Set Payment
      const intent_     = new Stripe({
          Amount        : this.Data.Order.Bill.NetPrice
        , JournalID     : this.Data._id
      })
      const intent      = await intent_.CreateIntent()
      this.Data.Payment = 
      { 
          ChannelParams : intent
        , Amount        : this.Data.Order.Bill.NetPrice
      }
      await db.journal.Save(this.Data)

      test.Set('JournalID', this.Data._id) // #101

      const data_ =
      {
          Sheet   : { ...this.Data.Order }
        , Stripe  : { ...intent          }
      }

      console.log('checkout-initiated', {Data : data_}, data_.Sheet)
      return data_
    }

    this.UpdateStatus = async function(req)
    {
      const sign    = req.headers['stripe-signature']
          , stripe_ = new Stripe()

      let   event_ = {}, journal_id
      if(!test.IsEnabled)
      {
        event_     = await stripe_.MatchEventSign(req.RawBody, sign)
        journal_id = event_.data.object.metadata.JournalID
      }
      else
      {
        event_.type = states.StripeSucess
        journal_id  = test.Get('JournalID')
      }

      this.Data = await db.journal.GetByID(journal_id)
      if (!this.Data) Err_(code.BAD_REQUEST, reason.JournalNotFound)

      this.Data.Payment.TimeStamp = Date.now()
      switch (event_.type)
      {
      case states.StripeSucess:
        let cart_ = new Cart()
        await cart_.Flush(this.Data.Buyer.ID)
        this.Data.Payment.Status = states.Success
        this.Data.Transit.Status = states.Initiated
        break

      case states.StripeFailed:
        this.Data.Payment.Status = states.Failed
        break
      }
      return event_.type
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
}

module.exports =
{
  Journal: Journal
}