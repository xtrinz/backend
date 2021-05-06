const { ObjectID }        = require("mongodb")
const { status, reason }  = require("../common/error")
const { states, type }    = require("../common/models")
const { Cart }            = require("./cart")

function Journal()
{
    this._id      = ''
    this.Staus    = states.None
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
        , ShipmentCost    : 0
        , Tax             : 0
        , NetPrice        : 0
    }
    this.Payment  =
    {
          Channel         : ''
        , TransactionID   : ''
        , Amount          : ''
        , Status          : ''
        , TimeStamp       : ''      // Status notified timestamp
    }
    this.Transit  = 
    {
          ID              : ''
        , FinalStatus     : ''
    }

    this.Save       = async function()
    {
        console.log('save-journal', this)
        const   query = { _id     : this._id }
              , act   = { $set    : this     }
              , opt   = { upsert  : true     }
        const resp  = await users.updateOne(query, act, opt)
        if (resp.modifiedCount !== 1)
        {
            console.log('save-journal-failed', this)
            const   code_   = code.INTERNAL_SERVER
                  , status_ = status.Failed
                  , reason_ = reason.DBAdditionFailed
            throw new Err(code_, status_, reason_)
        }
    }

    this.New    = function(data)
    {
      let cart   = new Cart()
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

      this.CartID = cart._id
      this.Seller = 
      {
            ID        : store._id
          , Name      : store.Name
          , Location  : store.Location
          , Address   : store.Address
      }
      this.Buyer = 
      {
            ID        : data.User._id
          , Name      : data.User.Name
          , Location  : data.Location
          , Address   : data.Address
      }
      this.Products = data_.Products
      this.Bill     = data_.Bill
      this._id      = new ObjectID()
      this.Save()
      // Init Payment intent
      return data_
    }


}

module.exports =
{
  Journal: Journal
}