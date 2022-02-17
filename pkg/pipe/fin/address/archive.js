const { ObjectId } = require('mongodb')
    , { db }       = require('../../../sys/database')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')

const Insert     = async function (data)
{
    const key  = { _id : data._id }
        , act  = { $set : data    }
        , opt  = { upsert : true  }
        , resp = await db().addresses.updateOne(key, act, opt)    

    if (!resp.acknowledged)
    {
        Log('address-insertion-failed', 
        { Key: key, Action: act, Option: opt, Result: resp.result} )
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBInsertionFailed)
    }
    Log('address-inserted', { Address: data })
}

const Read     = async function (client_id, addr_id)
{
    const query = 
        {
               ClientID : ObjectId(client_id) 
            , '_id'     : ObjectId(addr_id)
        }
        , proj  = { projection: { ClientID : 0 } }

    let resp = await db().addresses.findOne(query, proj)
    if (!resp)
    {
        Log('no-address-found', { Query: query, Projection: proj } )
        Model.Err_(Model.code.NOT_FOUND, Model.reason.AddressNotFound)
    }
    
    resp.Longitude = resp.Location.coordinates[0].toFixed(6)
    resp.Latitude  = resp.Location.coordinates[1].toFixed(6)
    delete resp.Location

    resp.AddressID = resp._id
    delete resp._id

    Log('address-read', { Address: resp })
    return resp
}

const List     = async function (client_id)
{
    const query = { ClientID  : ObjectId(client_id) }
        , opt   = { projection  : { ClientID: 0 } }
        , resp  = await db().addresses.find(query, opt).toArray()

    resp.forEach((addr)=>
    {
        addr.Longitude = addr.Location.coordinates[0].toFixed(6)
        addr.Latitude  = addr.Location.coordinates[1].toFixed(6)
        delete addr.Location

        addr.AddressID = addr._id
        delete addr._id
    })

    Log('address-list', { Addr : resp })
    return resp
}

const Update     = async function (client_id, data)
{
    const query =
        {
            ClientID : ObjectId(client_id),
            _id      : ObjectId(data._id)
        }
        , opts  = { $set : data }
        , resp  = await db().addresses.updateOne(query, opts)
    if (resp.modifiedCount !== 1)
    {
        Log('address-update-failed', { Query: query, Options: opts })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBUpdationFailed)
    }
    Log('address-updated', { Query: query, Options: opts })
}

const ResetDefault = async function (client_id)
{

    const query = { ClientID  : ObjectId(client_id), IsDefault: true }
        , opts  = { $set : { IsDefault: false } }

    Log('reset-default-address-flag', { Query: query, Options: opts })

    await db().addresses.updateOne(query, opts)
}

const Remove      = async function (client_id, addr_id)
{
    const query = 
        { 
            ClientID : ObjectId(client_id),
            _id      : ObjectId(addr_id)
        }

    const resp = await db().addresses.deleteOne(query)
    if (resp.deletedCount !== 1)
    {
        Log('address-removal-failed', { Query: query, Resp : resp })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBRemovalFailed)
    }
    Log('address-removed', { Query: query })
}

module.exports = 
{
      Insert        , Read
    , List          , Update
    , ResetDefault  , Remove
}