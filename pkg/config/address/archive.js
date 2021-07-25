const { ObjectId }           = require('mongodb')
    , { users }              = require('../../common/database')
    , { Err_, code, reason } = require('../../common/error')

const Insert     = async function (user_id, addr)
{
    const query   = { _id: ObjectId(user_id) }
        , opts    = { $push: { AddressList: addr } }
    const resp    = await users.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('address-insertion-failed', { Query: query, Options: opts } )
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    console.log('address-inserted', { Query: query, Options: opts })
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
        console.log('no-address-found', { Query: query, Projection: proj } )
        Err_(code.NOT_FOUND, reason.AddressNotFound)
    }
    
    resp = resp.AddressList[0]
    delete resp.State
    resp.Longitude = resp.Location.coordinates[0]
    resp.Latitude  = resp.Location.coordinates[1]
    delete resp.Location

    console.log('address-read', { Address: resp })
    return resp
}

const List     = async function (user_id)
{
    const query = { _id: ObjectId(user_id) }
        , opt   = { $project  : { 'AddressList': 1 } }
        , resp  = await users.findOne(query, opt)

    resp.AddressList.forEach((addr)=>
    {
        delete addr.State
        addr.Longitude = addr.Location.coordinates[0]
        addr.Latitude  = addr.Location.coordinates[1]
        delete addr.Location
    })

    console.log('address-list', {Addresses : resp.AddressList })
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
        console.log('address-update-failed', { Query: query, Options: opts })
        Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
    }
    console.log('address-updated', { Query: query, Options: opts })
}

const ResetDefault = async function (user_id)
{

    const query = { _id  : ObjectId(user_id), 'AddressList.IsDefault': true }
        , opts  = { $set : { 'AddressList.$.IsDefault': false } }
    
    console.log('reset-default-address-flag', { Query: query, Options: opts })

    await users.updateOne(query, opts)
}

const Remove      = async function (user_id, addr_id)
{
    const query = { _id: ObjectId(user_id) }
        , opts  = { $pull: { AddressList: {_id: ObjectId(addr_id)} } }

    const resp  = await users.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('address-removal-failed', { Query: query, Options: opts })
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    console.log('address-removed', { Query: query, Options: opts })
}

module.exports = 
{
      Insert       : Insert
    , Read         : Read
    , List         : List
    , Update       : Update
    , ResetDefault : ResetDefault
    , Remove       : Remove
}