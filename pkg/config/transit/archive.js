const { ObjectId } = require('mongodb')
    , { transits } = require('../../system/database')
    , Model        = require('../../system/models')

const Get = async function(param, qType)
{
    console.log('find-transit', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case Model.query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.Custom : query_ = param                    ; break;
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
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    console.log('transit-saved', { Transit: data })
}

const SetSockID  = async function(mode_, _id, sock_id)
{
    let key, act
    switch(mode_)
    {
        case Model.mode.Store:
            key = { 'Store._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Store.SockID' : sock_id } }
            break
        case Model.mode.Agent:
            key = { 'Agent._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Agent.SockID' : sock_id } }        
            break
        case Model.mode.Admin:
            key = { 'Admin._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Admin.SockID' : sock_id } }
            break
        case Model.mode.User:
            key = { 'User._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'User.SockID' : sock_id } }
            break
    }
    const resp = await transits.updateMany(key, act)
    if (!resp.acknowledged)
    {
        console.log('set-socket-id-failed',
        { 
            Key     : key, 
            Value   : act,
            Result  : resp.result
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    console.log('socket-id-set', { Mode: mode_, ID: _id, SockID: sock_id })
}

const ClearSockID  = async function(mode_, _id, sock_id)
{
    console.log('pop-socket-id', { Mode: mode_, ID: _id, SockID: sock_id })
    let key, act
    switch(mode_)
    {
        case Model.mode.Store:
            key = { 'Store._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Store.SockID' : sock_id } }
            break
        case Model.mode.Agent:
            key = { 'Agent._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Agent.SockID' : sock_id } }        
            break
        case Model.mode.Admin:
            key = { 'Admin._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'Admin.SockID' : sock_id } }
            break
        case Model.mode.User:
            key = { 'User._id' : ObjectId(_id), IsLive : true }
            act = { $push       : { 'User.SockID' : sock_id } }
            break
    }
    const resp = await transits.updateMany(key, act)
    if (!resp.acknowledged)
    {
        console.log('pop-socket-id-failed',
        { 
            Key     : key, 
            Value   : act,
            Result  : resp.result
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    console.log('socket-id-removed', { Mode: mode_, ID: _id, SockID: sock_id })
}

module.exports =
{
      Get         : Get
    , Save        : Save
    , SetSockID   : SetSockID
    , ClearSockID : ClearSockID
}