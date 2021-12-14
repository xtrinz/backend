const { db }        = require('../../system/database')
    , Model         = require('../../system/models')
    , { ObjectId }  = require('mongodb')
    , Log           = require('../../system/log')

const Save       = async function(data)
{
    Log('save-user', { User: data })
    const query_ = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await db().users.updateOne(query_, act, opt)
    if (!resp.acknowledged)
    {
        Log('user-save-failed', { User: data, Result: resp.result})
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    Log('user-saved', { User : data })
}

const Get = async function(param, qType)
{
    Log('find-user', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case Model.query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case Model.query.ByMail     : query_ = { Email: param }         ; break;
    }
    let user = await db().users.findOne(query_)
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

    const query_ = { _id: ObjectId(user_id), IsLive: true }

    let user = await db().users.findOne(query_)
    if(!user)
    {
        Log('user-not-found', query_)
        return []
    }
    Log('user-found', { User : user })
    return user.SockID
}

module.exports = { Save, Get, SockID }