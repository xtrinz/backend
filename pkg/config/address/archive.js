const { ObjectId }           = require('mongodb')
    , { users }              = require('../../system/database')
    , { Err_, code, reason } = require('../../system/models')
    , Log                   = require('../../system/logger')

const Insert     = async function (user_id, addr)
{
    const query   = { _id: ObjectId(user_id) }
        , opts    = { $push: { AddressList: addr } }
    const resp    = await users.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        Log('address-insertion-failed', { Query: query, Options: opts } )
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    Log('address-inserted', { Query: query, Options: opts })
}

const Read     = async function (user_id, addr_id)
{
    const query = 
        {
                _id               : ObjectId(user_id) 
            , 'AddressList._id' : ObjectId(addr_id)
        }
        , proj  = { projection: {'AddressList.$': 1} }

    let resp = await users.findOne(query, proj)
    if (!resp)
    {
        Log('no-address-found', { Query: query, Projection: proj } )
        Err_(code.NOT_FOUND, reason.AddressNotFound)
    }
    
    resp = resp.AddressList[0]
    resp.Longitude = resp.Location.coordinates[0].toFixed(6)
    resp.Latitude  = resp.Location.coordinates[1].toFixed(6)
    delete resp.Location

    resp.AddressID = resp._id
    delete resp._id

    Log('address-read', { Address: resp })
    return resp
}

const List     = async function (user_id)
{
    const query = { _id: ObjectId(user_id) }
        , opt   = { $project  : { 'AddressList': 1 } }
        , resp  = await users.findOne(query, opt)

    resp.AddressList.forEach((addr)=>
    {
        addr.Longitude = addr.Location.coordinates[0].toFixed(6)
        addr.Latitude  = addr.Location.coordinates[1].toFixed(6)
        delete addr.Location

        addr.AddressID = addr._id
        delete addr._id
    })

    Log('address-list', {Addresses : resp.AddressList })
    return resp.AddressList
}

const Update     = async function (user_id, data)
{
    const query =
        {
            _id               : ObjectId(user_id),
            'AddressList._id' : ObjectId(data._id)
        }
        , opts  = { $set : { 'AddressList.$': data } }
        , resp  = await users.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        Log('address-update-failed', { Query: query, Options: opts })
        Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
    }
    Log('address-updated', { Query: query, Options: opts })
}

const ResetDefault = async function (user_id)
{

    const query = { _id  : ObjectId(user_id), 'AddressList.IsDefault': true }
        , opts  = { $set : { 'AddressList.$.IsDefault': false } }
    
    Log('reset-default-address-flag', { Query: query, Options: opts })

    await users.updateOne(query, opts)
}

const Remove      = async function (user_id, addr_id)
{
    const query = { _id: ObjectId(user_id) }
        , opts  = { $pull: { AddressList: {_id: ObjectId(addr_id)} } }

    const resp  = await users.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        Log('address-removal-failed', { Query: query, Options: opts })
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    Log('address-removed', { Query: query, Options: opts })
}

module.exports = 
{
      Insert        , Read
    , List          , Update
    , ResetDefault  , Remove
}