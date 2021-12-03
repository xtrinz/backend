const { ObjectId } = require('mongodb')
    
class Address
{
    constructor(data)
    {
        this._id          = new ObjectId()
        this.Location     =
        {
              type        : 'Point'
            , coordinates : [ data.Longitude.loc(), data.Latitude.loc() ]
        }
        this.Tag          = data.Tag
        this.IsDefault    = data.IsDefault
        this.Name         = data.Name
        this.Line1        = data.Line1
        this.Line2        = data.Line2
        this.City         = data.City
        this.PostalCode   = data.PostalCode
        this.State        = data.State
        this.Country      = data.Country
    }
}

module.exports = Address