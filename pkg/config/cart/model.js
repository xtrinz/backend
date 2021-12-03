
const { ObjectId } = require('mongodb')

class Cart
{
    constructor(user_id)
    {
        this._id       = ''
        this.UserID    = ObjectId(user_id)
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
      this.StoreID     = ObjectId(data.StoreID)
      this.Quantity    = data.Quantity
    }
}

module.exports = { Cart, Entry }