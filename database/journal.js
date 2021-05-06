const { ObjectID }     = require("mongodb")
const { states, type } = require("../common/models")

function Journal(data)
{
    this._id      = ''
    this.Staus    = states.None
    this.Type     = type.FORWARD
    this.ReturnID = ''
    this.Date     = Date.now()      // Millis eases math
    this.Products = []              // { ProductID | Name | Price | Image | Quantity }

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

    this.New       = function(data)
    {
      // data.AddressID
      const address = this.GetByID(ObjectId(Id))
      if (!cart)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.CartNotFound
        throw new Err(code_, status_, reason_)
      }
    }

}

module.exports =
{
  Journal: Journal
}