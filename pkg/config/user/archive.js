const { users }             = require('../../system/database')
    , { query,
        Err_, code, reason} = require('../../system/models')
    , { ObjectId }          = require('mongodb')
    , Log                  = require('../../system/logger')

const Save       = async function(data)
{
    Log('save-user', { User: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await users.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('user-save-failed', { User: data, Result: resp.result})
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    Log('user-saved', { User : data })
}

const Get = async function(param, qType)
{
    Log('find-user', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case query.ByMail     : query_ = { Email: param }         ; break;
    }
    let user = await users.findOne(query_)
    if (!user)
    {
        Log('user-not-found', { Query : query_ })
        return
    }
    Log('user-found', { User: user })
    return user
}

const SockID = async function(user_id)
{
    Log('get-user-sock-id', { UserID: user_id })

    const query = { _id: ObjectId(user_id), IsLive: true }

    let user = await users.findOne(query)
    if(!user)
    {
        Log('user-not-found', query)
        return []
    }
    Log('user-found', { User : user })
    return user.SockID
}

module.exports = { Save, Get, SockID }