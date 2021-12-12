const { ObjectId }           = require('mongodb')
    , { db }            = require('../../system/database')
    , { Err_, code, reason } = require('../../system/models')
    , Log                   = require('../../system/log')

const Insert = async function(_id, mode_, sock_id) 
{
    const rcd_  = { Entity: ObjectId(_id), Mode: mode_, SockID: sock_id }
    , resp  = await db().sockets.insertOne(rcd_)
    if (!resp.acknowledged)
    {
        Log('socket-insertion-failed', {Scoket : rcd_})
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    Log('socket-inserted', {Scoket : rcd_})
}

const Get     = async function (sock_id)
{
    Log('read-socket', { SocketID: sock_id })
    const query = { SockID : sock_id }
        , resp  = await db().sockets.findOne(query)
    if (!resp) Err_(code.NOT_FOUND, reason.NoSocketFound)
    Log('socket-read', { Socket: resp })
    return resp
}

const Remove = async function(_id, mode_, sock_id) 
{
    const query = { Entity: ObjectId(_id), Mode: mode_, SockID: sock_id }
        , resp  = await db().sockets.deleteOne(query)
    if (resp.deletedCount !== 1) 
    {
        Log('socket-removal-failed', { Query: query })
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    Log('socket-removed', { Query: query })
}

module.exports = 
{
      Insert : Insert
    , Get    : Get
    , Remove : Remove
}