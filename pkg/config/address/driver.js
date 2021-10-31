const { ObjectId, ObjectID } = require('mongodb')
    , Model                  = require('../../system/models')
    , db                     = require('../exports')[Model.segment.db]

class Address
{
    constructor(data)
    {
        this._id          = new ObjectID()
        this.Location     =
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
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

    async Insert(user_id, addrs)
    {
        console.log('insert-address', { Address: this })

        if(addrs.length > Model.limits.AddressCount)
        {
            console.log('address-max-count-exceeded', { Addresses: addrs } )
            Err_(code.INTERNAL_SERVER, reason.AddressLimitExceeded)
        }

        if(this.IsDefault) await db.address.ResetDefault(user_id)

        await db.address.Insert(user_id, this)

        return this._id
    }

    static async Read(data)
    {
        console.log('read-address', data)
        const addr = await db.address.Read(data.UserID, data.AddressID)
        return addr
    }

    static async List(user_id)
    {
        console.log('list-address', { UserID : user_id })
        const list = await db.address.List(user_id)
        return list
    }

    static async Update(data)
    {
        console.log('update-address', { Address : data })

        const user_id = data.User._id
        delete data.User

        if(data.IsDefault) await db.address.ResetDefault(user_id)

        data._id  = ObjectId(data.AddressID)
        delete data.AddressID

        await db.address.Update(user_id, data)
    }

    static async Remove(user_id, addr_id)
    {
        console.log('remove-address',
        {
              UserID    : user_id
            , AddressID : addr_id
        })

        await db.address.Remove(user_id, addr_id)
    }
}

module.exports = 
{
    Address : Address
}