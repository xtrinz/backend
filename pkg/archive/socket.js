const { ObjectId }           = require('mongodb')
    , { sockets, transits }  = require('../common/database')
    , { Err_, code, reason } = require('../common/error')

function Socket()
{
    this.Data = { _id : '', SockID : '' }
    this.Insert     = async function (user, sock_id)
    {
        const rcd_  = { _id: ObjectId(user.Data._id), SockID: sock_id }
            , resp  = await sockets.insertOne(rcd_)
        if (resp.insertedCount !== 1) 
        {
            console.log('socket-insertion-failed', rcd_)
            Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
        }
        console.log('socket-inserted', rcd_)

        console.log('set-socket-id', { UserID: user.Data._id, SockID: sock_id })
        const key1  = { 'Agent._id' : ObjectId(user.Data._id), IsLive : true }
            , act1  = { $push       : { 'Agent.SockID' : sock_id } }
            , resp1 = await transits.updateMany(key1, act1)
        if (!resp1.result.ok)
        {
            console.log('set-socket-id-failed',
            { 
                Key     : key1, 
                Value   : act1,
                Result  : resp1.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }

        const key2  = { 'User._id' : ObjectId(user.Data._id), IsLive : true }
            , act2  = { $push      : { 'User.SockID' : sock_id } }
            , resp2 = await transits.updateMany(key2, act2)
        if (!resp2.result.ok)
        {
            console.log('set-socket-id-failed',
            { 
                Key     : key2, 
                Value   : act2,
                Result  : resp2.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }

        let str_stores = [ ...user.Data.StoreList.Owned, ...user.Data.StoreList.Accepted ]
            str_stores = str_stores.map(ObjectId)
        const key3  = { 'Store._id' : { $in: str_stores }, IsLive : true }
            , act3  = { $push      : { 'Store.SockID' : sock_id } }
            , resp3 = await transits.updateMany(key3, act3)
        if (!resp3.result.ok)
        {
            console.log('set-socket-id-failed',
            { 
                Key     : key3, 
                Value   : act3,
                Result  : resp3.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('user-sock-id-set', { UserID: user.Data._id, SockID: sock_id })

    }
    this.Get     = async function (sock_id)
    {
        const query = { SockID : sock_id }
            , resp  = await sockets.findOne(query)
        if (!resp) Err_(code.NOT_FOUND, reason.NoSocketFound)
        console.log('socket-read', resp)
        return resp
    }
    this.Remove     = async function (user, sock_id)
    {
        const query = { _id: ObjectId(user.Data._id) }
            , resp  = await sockets.deleteOne(query)
        if (resp.deletedCount !== 1) 
        {
            console.log('socket-removal-failed', query)
            Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
        }        
        console.log('socket-removed', query)

        console.log('pop-socket-id', { UserID: user.Data._id, SockID: sock_id })
        const key1  = { 'Agent._id' : ObjectId(user.Data._id), IsLive : true }
            , act1  = { $pull       : { 'Agent.SockID' : sock_id } }
            , resp1 = await transits.updateMany(key1, act1)
        if (!resp1.result.ok)
        {
            console.log('pop-socket-id-failed',
            { 
                Key     : key1, 
                Value   : act1,
                Result  : resp1.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }

        const key2  = { 'User._id' : ObjectId(user.Data._id), IsLive : true }
            , act2  = { $pull      : { 'User.SockID' : sock_id } }
            , resp2 = await transits.updateMany(key2, act2)
        if (!resp2.result.ok)
        {
            console.log('pop-socket-id-failed',
            { 
                Key     : key2, 
                Value   : act2,
                Result  : resp2.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }

        let str_stores = [ ...user.Data.StoreList.Owned, ...user.Data.StoreList.Accepted ]
            str_stores = str_stores.map(ObjectId)
        const key3  = { 'Store._id' : { $in: str_stores }, IsLive : true }
            , act3  = { $pull       : { 'Store.SockID' : sock_id } }
            , resp3 = await transits.updateMany(key3, act3)
        if (!resp3.result.ok)
        {
            console.log('pop-socket-id-failed',
            { 
                Key     : key3, 
                Value   : act3,
                Result  : resp3.result
            })
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('user-sock-id-poped', { UserID: user.Data._id, SockID: sock_id })

    }
}

module.exports = 
{
    Socket : Socket
}