const { ObjectId } = require('mongodb')

class Product
{
    constructor(data)
    {
        this._id          = new ObjectId()
        this.StoreID      = ObjectId(data.Store._id)
        this.Name         = data.Name
        this.Image        = data.Image
        this.Price        = data.Price
        this.Quantity     = data.Quantity
        this.Description  = data.Description
        this.Category     = data.Category
        this.VolumeBase   = data.VolumeBase
        this.Unit         = data.Unit
        this.IsAvailable  = true
        this.HasCOD       = data.HasCOD
        this.Location     = data.Store.Address.Location     
    }
}

module.exports = Product