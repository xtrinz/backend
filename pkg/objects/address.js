const { ObjectId, ObjectID } = require("mongodb")
    , { users }              = require("../common/database")
    , { Err_, code, reason } = require("../common/error")
    , { states }             = require('../common/models')

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
        , State             : states.New
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
        const query   = { _id: ObjectId(user_id) }
            , opts    = { $push: { AddressList: this.Data } }

        const resp    = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-insertion-failed', this)
            Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
        }
        console.log('address-inserted', query, opts, this.Data.Address)
        return this.Data._id
    }

    this.Read     = async function (data)
    {
        const   query   = 
                {
                      _id               : ObjectId(data.UserID) 
                    , 'AddressList._id' : ObjectId(data.AddressID)
                }
              , proj = { projection: {'AddressList.$': 1} }
        let resp = await users.findOne(query, proj)
        if (!resp) Err_(code.NOT_FOUND, reason.AddressNotFound)
        resp = resp.AddressList[0]
        delete resp.State
        resp.Longitude = resp.Location.coordinates[0]
        resp.Latitude  = resp.Location.coordinates[1]
        delete resp.Location
        console.log('address-read', resp)
        return resp
    }

    this.List     = async function (user_id)
    {
        const query =  { _id: ObjectId(user_id) }

        const opt = { $project  : { 'AddressList': 1 } }
            , resp  = await users.findOne(query, opt)

        resp.AddressList.forEach((addr)=>
        {
            delete addr.State
            addr.Longitude = addr.Location.coordinates[0]
            addr.Latitude  = addr.Location.coordinates[1]
            delete addr.Location
        })

        console.log('address-list', resp.AddressList)
        return resp.AddressList
    }

    this.Update     = async function (data)
    {
        const query =
        {
            _id               : ObjectId(data.User._id),
            'AddressList._id' : ObjectId(data.AddressID)
        }

        data._id  = ObjectId(data.AddressID)
        delete data.User
        delete data.AddressID

        const opts  = { $set : { 'AddressList.$': data } }
        const resp  = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-update-failed', query, opts)
            Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
        }
        console.log('address-updated', query, opts)
    }

    this.Remove     = async function (user_id, entry_id)
    {
        const query = { _id: ObjectId(user_id) }
            , opts  = { $pull: { AddressList: {_id: ObjectId(entry_id)} } }

        const resp  = await users.updateOne(query, opts)
        if (resp.modifiedCount !== 1) 
        {
            console.log('address-removal-failed', query, opts)
            Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
        }
        console.log('address-removed', query, opts)
    }
}

module.exports = 
{
    Address : Address
}