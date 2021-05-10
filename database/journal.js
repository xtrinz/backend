const { User }                     = require("./user")
    , { Cart }                     = require("./cart")
    , { Store }                    = require("./store")
    , { ObjectID }                 = require("mongodb")
    , { Transit }                  = require("./transit")
    , { journals }                 = require("./connect")
    , { Err, code, status, reason }= require("../common/error")
    , { states, type, channel }    = require("../common/models")
    , { Stripe }                   = require("../common/stripe")
    , { states, entity }           = require("../machine/models")

function Journal()
{
    this._id      = ''
    this.Status   = states.None
    this.Type     = type.FORWARD
    this.CartID   = ''
    this.ReturnID = ''
    this.Date     = Date.now()  // Millis eases math
    this.Products = []          // { ProductID | Name | Price | Image | Quantity }

    this.Buyer    =
    {
        ID              : ''
      , Name            : ''
      , Location        : {}
      , Address         : {}
    }
    this.Seller   =
    {
        ID              : ''
      , Name            : ''
      , Location        : {}
      , Address         : {}
    }
    this.Bill     = 
    {
        Total           : 0
      , TransitCost     : 0
      , Tax             : 0
      , NetPrice        : 0
    }
    this.Payment  =
    {
        Channel         : channel.Stripe
      , TransactionID   : ''
      , Amount          : ''
      , Status          : states.Initiated
      , TimeStamp       : ''      // Webhook hit time
    }
    this.Transit  = 
    {
      ID              : ''
      , FinalStatus     : states.None
    }

    this.Set(data)
    {
      this._id      = data._id
      this.Status   = data.Status
      this.Type     = data.Type
      this.CartID   = data.CartID
      this.ReturnID = data.ReturnID
      this.Date     = data.Date
      this.Products = data.Products 
      this.Buyer    = data.Buyer
      this.Seller   = data.Seller
      this.Bill     = data.Bill
      this.Payment  = data.Payment
      this.Transit  = data.Transit
    }

    this.GetByID = function(_id)
    {
       console.log(`find-journal-by-id. ID: ${_id}`)
       const query = { _id: ObjectId(_id) }
       let journal = await journals.findOne(query)
       if (!journal)
       {
         console.log(`journal-not-found. ID: ${query}`)
         return
       }
       this.Set(journal)
       console.log(`journal-found. cart: ${journal}`)
       return journal
    }

    this.Save       = async function()
    {
        console.log('save-journal', this)
        const   query = { _id     : this._id }
              , act   = { $set    : this     }
              , opt   = { upsert  : true     }
        const resp  = await journals.updateOne(query, act, opt)
        if (resp.modifiedCount !== 1)
        {
            console.log('save-journal-failed', this)
            const   code_   = code.INTERNAL_SERVER
                  , status_ = status.Failed
                  , reason_ = reason.DBAdditionFailed
            throw new Err(code_, status_, reason_)
        }
    }

    this.New    = function(data)          // Flow, if not intent exists(no previous payment attempts)
    {
      let   cart  = new Cart()
      const data_ = cart.Read(data)
      if (!data_.Products.length)
      {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.NoProductsFound
            throw new Err(code_, status_, reason_)
      }

      const   storeId = this.Products[0].StoreID
            , store_  = new Store()
            , store   = store_.GetByID(storeId)
      if (!store)
      {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.StoreNotFound
            throw new Err(code_, status_, reason_)
      }

      this.CartID    = cart._id
      this.Seller    = 
      {
              ID        : store._id
            , Name      : store.Name
            , Location  : store.Location
            , Address   : store.Address
      }
      this.Buyer     = 
      {
              ID        : data.User._id
            , Name      : data.User.Name
            , Location  : data.Location
            , Address   : data.Address
      }
      this.Products  = data_.Products
      this.Bill      = data_.Bill
      this._id       = new ObjectID()
      const str_data =
      {
              Amount    : this.Bill.NetPrice
            , UserID    : this._id
            , JournalID : this.Buyer.ID
      }
      // Init payment intent
      const intent_  = new Stripe(str_data)
      const intent   = intent_.CreateIntent()

      this.Payment.TransactionID    = intent.id
      this.Payment.Amount           = data_.Bill.NetPrice
      this.Save()

      // TODO Add Journal ID to the cart & remove it only after payment success

      data_ = {...data_, ...intent}
      console.log('checkout-initiated', data_)
      return data_
    }

    this.UpdateStatusAndInitTransit = function(req)
    {
      const   sign       = req.headers["stripe-signature"]
            , stripe_    = new Stripe()
            , event      = stripe_.MatchEventSign(req, sign)
            , journal_id = event.data.object.metadata.JournalID
      
      let journal = this.GetByID(journal_id)
      if (!journal)
      {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.JournalNotFound
            throw new Err(code_, status_, reason_)
      }

      if (event.type === "payment_intent.succeeded")
      {
            this.Payment.Status = states.Success
            this.Transit.Status = states.Initiated
            this.Save()

            let transit = new Transit(this)
            transit.Init()
            return
      } 
      else if (event.type === "payment_intent.payment_failed")
      {
            this.Payment.Status = states.Failed
            this.Save()
      }     
    }

    this.List = function(data)
    {
      switch(data.Entity)
      {
            case entity.User:
            let user    = new User()
            const user_ = user.GetByID(data.UserID)
            if (!user_)
            {
                  const     code_ = code.NOT_FOUND
                        , status_ = status.Failed
                        , reason_ = reason.UserNotFound
                  throw new Err(code_, status_, reason_)
            }
            const data_ = {}
            /* const   query = 
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
                              , Transit  : { ID : 1 , FinalStatus : 1 }
                        }
            const data_   = this.Get(query, proj) */
            return data_

            case entity.Store:
            let store    = new Store()
            const store_ = store.GetByIDAndMgmtID(data.UserID, data.StoreID)
            if (!store_)
            {
                  const     code_ = code.NOT_FOUND
                        , status_ = status.Failed
                        , reason_ = reason.StoreNotFound
                  throw new Err(code_, status_, reason_)
            }
            break
      }
    }

    this.Read = function(data)
    {
      switch(data.Entity)
      {
            case entity.User:
            let data_
            return data_

            case entity.Store:
            let data_
            return data_      
      }
    }

    this.PayOut(ctxt)
    {
      switch (ctxt.State)
      {
      case states.TranistCompleted:
      break
      case states.CargoCancelled  :
      break
      case states.OrderRejected   :
      break
      case states.TransitRejected :
      break
      }
    }
}

module.exports =
{
  Journal: Journal
}