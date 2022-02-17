
const { ObjectId } = require('mongodb')

class Cart
{
    constructor(client_id)
    {
        this._id       = ''
        this.ClientID    = ObjectId(client_id)
        this.Products  = []
        this.JournalID = ''
    }
}

class Entry
{
    constructor(data)
    {    
      this._id         = ''
      this.ProductID   = ObjectId(data.ProductID)
      this.SellerID     = ObjectId(data.SellerID)
      this.Quantity    = data.Quantity
    }
}

module.exports = { Cart, Entry }