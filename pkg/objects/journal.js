const { User }                           = require('./user')
    , { Cart }                           = require('./cart')
    , { Store }                          = require('./store')
    , { ObjectID, ObjectId }             = require('mongodb')
    , test                               = require('../common/test')
    , { Err_, code, reason }             = require('../common/error')
    , { states, channel, entity, query } = require('../common/models')
    , { Stripe }                         = require('../common/stripe')
    , { journals }                       = require('../common/database')

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
      , Agents            : []
      /**
       * { ID: , Earnings: { FirstMile | SecondMile | Penalty | ReasonForPenalty |  }}
       */
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

    this.GetByID    = async function(_id)
    {
       console.log('find-journal-by-id', { ID: _id })
       const query = { _id: ObjectId(_id) }
       let journal = await journals.findOne(query)
       if (!journal)
       {
         console.log('journal-not-found', { ID: query})
         return
       }
       this.Data = journal
       console.log('journal-found', { Cart: journal})
       return journal
    }

    this.Save       = async function()
    {
        console.log('save-journal', this.Data)
        const query = { _id    : this.Data._id }
            , act   = { $set   : this.Data     }
            , opt   = { upsert : true          }
        const resp  = await journals.updateOne(query, act, opt)
        if (!resp.result.ok)
        {
            console.log('journal-save-failed', { Data: this.Data, Result: resp.result})
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('journal-saved', this.Data)
    }

    this.New    = async function(data)
    {
      // Set User
      this.Data.Buyer     = 
      {                 
          ID        : data.User._id
        , Name      : data.User.Name
        , MobileNo  : data.User.MobNo
        , Longitude : data.Longitude
        , Latitude  : data.Latitude
        , Address   : data.Address
      }

      // Set Cart
      let cart_           = new Cart()
      const cart_data     = await cart_.Read(data.User._id)

      if(!cart_data.Products.length) Err_(code.BAD_REQUEST, reason.NoProductsFound)

      if(cart_.Data.JournalID) { await this.GetByID(cart_.Data.JournalID) }
      this.Data.Order     = { ...cart_data }

      // Set Seller
      const store_  = new Store()
          , store   = await store_.Get(cart_.Data.Products[0].StoreID, query.ByID)
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
      await this.Save()

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

      let journal = await this.GetByID(journal_id)
      if (!journal) Err_(code.BAD_REQUEST, reason.JournalNotFound)

      this.Data.Payment.TimeStamp = Date.now()
      switch (event_.type)
      {
      case states.StripeSucess:
        let cart_ = new Cart()
        await cart_.Flush(journal.Buyer.ID)
        this.Data.Payment.Status = states.Success
        this.Data.Transit.Status = states.Initiated
        break

      case states.StripeFailed:
        this.Data.Payment.Status = states.Failed
        break
      }
      return event_.type
    }

    this.List = function(data)
    {
      switch(data.Entity)
      {
            case entity.User:
            let user    = new User()
            const user_ = user.GetByID(data.UserID)
            if (!user_) Err_(code.NOT_FOUND, reason.UserNotFound)

            const data_ = {}
            /* const query =
            { 
                Buyer :  { UserID : user._id }
              , Payment: { Status : states.Success } 
            }
            , proj  = 
            {
                _id      : 1
              , Seller   : { ID : 1 , Name : 1 }
              , Bill     : 1
              , Products : 1
              , Transit  : { ID : 1 , Status : 1, ClosingState: 1 }
            }
            const data_   = this.Get(query, proj) */
            return data_

            case entity.Store:
            let store    = new Store()
            const store_ = store.GetByIDAndMgmtID(data.UserID, data.StoreID)
            if (!store_) Err_(code.NOT_FOUND, reason.StoreNotFound)
            break
      }
    }

    this.Read = function(data)
    {
      let data_
      switch(data.Entity)
      {
            case entity.User:
            return data_

            case entity.Store:
            return data_      
      }
    }

    this.PayOut = async function (ctxt)
    {
      let journal = await this.GetByID(ctxt.Data.JournalID)
      if (!journal) Err_(code.BAD_REQUEST, reason.JournalNotFound)

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
      await this.Save()
    }
}

module.exports =
{
  Journal: Journal
}