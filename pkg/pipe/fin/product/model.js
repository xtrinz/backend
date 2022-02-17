const { ObjectId } = require('mongodb')

class Product
{
    constructor(data)
    {
        this._id          = new ObjectId()
        this.SellerID      = ObjectId(data.Seller._id)
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
        this.Location     = data.Seller.Address.Location     
    }
}

module.exports = Product