const { ObjectId
    , ObjectID } = require('mongodb')
    , db         = require('../address/archive')

function Address(data)
{
    if(data)
    this.Data =
    {
          _id               : ''
        , Location          :
        {
              type          : 'Point'
            , coordinates   : [data.Longitude, data.Latitude]
        }
        , Tag               : data.Tag
        , IsDefault         : data.IsDefault

        , Address           :
        {
              Name          : data.Address.Name
            , Line1         : data.Address.Line1
            , Line2         : data.Address.Line2
            , City          : data.Address.City
            , PostalCode    : data.Address.PostalCode
            , State         : data.Address.State
            , Country       : data.Address.Country
        }
    }

    this.Insert     = async function (user_id)
    {
        this.Data._id = new ObjectID()

        console.log('insert-address', { Address: this.Data })

        if(this.Data.IsDefault)
        { await db.ResetDefault(user_id) }

        await db.Insert(user_id, this.Data)

        return this.Data._id
    }

    this.Read     = async function (data)
    {
        console.log('read-address', data)
        const addr = await db.Read(data.UserID, data.AddressID)
        return addr
    }

    this.List     = async function (user_id)
    {
        console.log('list-address', { UserID : user_id })
        const list = await db.List(user_id)
        return list
    }

    this.Update     = async function (data)
    {
        console.log('update-address', { Address : data })

        const user_id = data.User._id
        delete data.User

        if(data.IsDefault)
        { await db.ResetDefault(user_id) }

        data._id  = ObjectId(data.AddressID)
        delete data.AddressID

        await db.Update(user_id, data)
    }

    this.Remove     = async function (user_id, addr_id)
    {
        console.log('remove-address', { 
              UserID    : user_id
            , AddressID : addr_id
        })

        await db.Remove(user_id, addr_id)
    }
}

module.exports = 
{
    Address : Address
}