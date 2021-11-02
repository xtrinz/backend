const { ObjectId }  = require('mongodb')
    , { transits } 	= require('../../system/database')
    , {   Err_
        , code
        , reason
        , query }   = require('../../system/models')

const Get = async function(param, qType)
{
    console.log('find-transit', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case query.Custom : query_ = param                    ; break;
    }
    let transit = await transits.findOne(query_)
    if (!transit)
    {
        console.log('transit-not-found', { Query : query_, Type : qType })
        return
    }
    console.log('transit-found', { Transits: transit })
    return transit
}

const Save       = async function(data, upsert)
{
    console.log('save-transit', { Transit: data })
    const key  = { _id    : data._id, State: data.Return }
        , act  = { $set   : data     }
        , opt  = { upsert : upsert   }
        , resp = await transits.updateOne(key, act, opt)
    if (!resp.acknowledged)
    {
        console.log('transit-save-failed',
        { 
              Key       : key
            , Action    : act
            , Option    : opt
            , Result: resp.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('transit-saved', { Transit: data })
}

const SetAgentSockID  = async function(user_id, sock_id)
{
    const key1  = { 'Agent._id' : ObjectId(user_id), IsLive : true }
        , act1  = { $push       : { 'Agent.SockID' : sock_id } }
        , resp1 = await transits.updateMany(key1, act1)
    if (!resp1.acknowledged)
    {
        console.log('set-agent-socket-id-failed',
        { 
            Key     : key1, 
            Value   : act1,
            Result  : resp1.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('agent-socket-id-set', { UserID: user_id, SockID: sock_id })
}

const SetUserSockID  = async function(user_id, sock_id)
{
    const key1  = { 'User._id' : ObjectId(user_id), IsLive : true }
        , act1  = { $push       : { 'User.SockID' : sock_id } }
        , resp1 = await transits.updateMany(key1, act1)
    if (!resp1.acknowledged)
    {
        console.log('set-user-socket-id-failed',
        { 
            Key     : key1, 
            Value   : act1,
            Result  : resp1.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('socket-user-id-set', { UserID: user_id, SockID: sock_id })
}

const SetStoreSockID  = async function(store_id, sock_id)
{
    const key3  = { 'Store._id' : ObjectId(store_id), IsLive : true }
        , act3  = { $push      : { 'Store.SockID' : sock_id } }
        , resp3 = await transits.updateMany(key3, act3)
    if (!resp3.acknowledged)
    {
        console.log('set-socket-id-failed',
        { 
            Key     : key3, 
            Value   : act3,
            Result  : resp3.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('set-socket-id-to-store-transit-context', { StoreID: store_id, SockID: sock_id })
}

const SetAdminSockID  = async function(admin_id, sock_id)
{
    const key3  = { 'Admin._id' : ObjectId(admin_id), IsLive : true }
        , act3  = { $push      : { 'Admin.SockID' : sock_id } }
        , resp3 = await transits.updateMany(key3, act3)
    if (!resp3.acknowledged)
    {
        console.log('set-socket-id-failed',
        { 
            Key     : key3, 
            Value   : act3,
            Result  : resp3.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('set-socket-id-to-admin-transit-context', { StoreID: admin_id, SockID: sock_id })
}

const UnsetAgentSockID  = async function(user_id, sock_id)
{
    console.log('pop-socket-id', { UserID: user_id, SockID: sock_id })
    const key1  = { 'Agent._id' : ObjectId(user_id), IsLive : true }
        , act1  = { $pull       : { 'Agent.SockID' : sock_id } }
        , resp1 = await transits.updateMany(key1, act1)
    if (!resp1.acknowledged)
    {
        console.log('pop-socket-id-failed',
        { 
            Key     : key1, 
            Value   : act1,
            Result  : resp1.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('agent-socket-id-removed', { UserID: user_id, SockID: sock_id })
}

const UnsetUserSockID  = async function(user_id, sock_id)
{
    const key2  = { 'User._id' : ObjectId(user_id), IsLive : true }
        , act2  = { $pull      : { 'User.SockID' : sock_id } }
        , resp2 = await transits.updateMany(key2, act2)
    if (!resp2.acknowledged)
    {
        console.log('pop-socket-id-failed',
        { 
            Key     : key2, 
            Value   : act2,
            Result  : resp2.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('socket-user-id-removed', { UserID: user_id, SockID: sock_id })
}

const UnsetStoreSockID  = async function(store_id, sock_id)
{
    const key3  = { 'Store._id' : ObjectId(store_id), IsLive : true }
        , act3  = { $pull       : { 'Store.SockID' : sock_id } }
        , resp3 = await transits.updateMany(key3, act3)
    if (!resp3.acknowledged)
    {
        console.log('pop-socket-id-failed',
        { 
            Key     : key3, 
            Value   : act3,
            Result  : resp3.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('removed-socket-id-from-store', { StoreID: store_id, SockID: sock_id })
}

const UnsetAdminSockID  = async function(admin_id, sock_id)
{
    const key3  = { 'Admin._id' : ObjectId(admin_id), IsLive : true }
        , act3  = { $pull       : { 'Admin.SockID' : sock_id } }
        , resp3 = await transits.updateMany(key3, act3)
    if (!resp3.acknowledged)
    {
        console.log('pop-socket-id-failed',
        { 
            Key     : key3, 
            Value   : act3,
            Result  : resp3.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('removed-socket-id-from-store', { AdminID: admin_id, SockID: sock_id })
}

module.exports =
{
      Get                 : Get
    , Save                : Save
    , SetAgentSockID      : SetAgentSockID
    , SetUserSockID       : SetUserSockID
    , SetStoreSockID      : SetStoreSockID
    , SetAdminSockID      : SetAdminSockID
    , UnsetAgentSockID    : UnsetAgentSockID
    , UnsetUserSockID     : UnsetUserSockID
    , UnsetStoreSockID    : UnsetStoreSockID
    , UnsetAdminSockID    : UnsetAdminSockID
}