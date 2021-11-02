const { ObjectId }           = require('mongodb')
    , { sockets }            = require('../../system/database')
    , { Err_, code, reason } = require('../../system/models')

const Insert = async function(_id, mode_, sock_id) 
{
    const rcd_  = { Entity: ObjectId(_id), Mode: mode_, SockID: sock_id }
    , resp  = await sockets.insertOne(rcd_)
    if (!resp.acknowledged)
    {
        console.log('socket-insertion-failed', {Scoket : rcd_})
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    console.log('socket-inserted', {Scoket : rcd_})
}

const Get     = async function (sock_id)
{
    console.log('read-socket', { SocketID: sock_id })
    const query = { SockID : sock_id }
        , resp  = await sockets.findOne(query)
    if (!resp) Err_(code.NOT_FOUND, reason.NoSocketFound)
    console.log('socket-read', { Socket: resp })
    return resp
}

const Remove = async function(_id, mode_, sock_id) 
{
    const query = { Entity: ObjectId(_id), Mode: mode_, SockID: sock_id }
        , resp  = await sockets.deleteOne(query)
    if (resp.deletedCount !== 1) 
    {
        console.log('socket-removal-failed', { Query: query })
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    console.log('socket-removed', { Query: query })
}

module.exports = 
{
      Insert : Insert
    , Get    : Get
    , Remove : Remove
}