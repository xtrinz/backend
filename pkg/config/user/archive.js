const { users }             = require('../../system/database')
    , { query, mode,
        Err_, code, reason} = require('../../system/models')
    , { ObjectId }          = require('mongodb')

const Save       = async function(data)
{
    console.log('save-user', { User: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await users.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        console.log('user-save-failed', { User: data, Result: resp.result})
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('user-saved', { User : data })
}

const Get = async function(param, qType)
{
    console.log('find-user', { Param: param, QType: qType} )
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
        console.log('user-not-found', { Query : query_ })
        return
    }
    console.log('user-found', { User: user })
    return user
}

const NearbyAdmin = async function(ln, lt)
{
    ln = ln.loc()
    lt = lt.loc()

    console.log('get-nearest-admin', {Location: [ln, lt]} )
    const proj    = { projection: { _id: 1, Name: 1, SockID: 1, MobileNo: 1 } }
        , query   =
        { 
            Location  :
            {
                $near : { $geometry    : { type: 'Point', coordinates: [ln, lt] } }
            }
            , Mode    : mode.Admin
        }

    const admin_ = await users.findOne(query, proj)
    if (!admin_)
    {
        console.log('no-admin-found', { Location: [ln, lt]})
        return
    }
    console.log('admin-found', { Admin: admin_ })
    return admin_
}

const GetUserSockID = async function(user_id)
{
    console.log('get-user-sock-id', { UserID: user_id })

    const query = { _id: ObjectId(user_id), IsLive: true }

    let user = await users.findOne(query)
    if(!user)
    {
        console.log('user-not-found', query)
        return []
    }
    console.log('user-found', { User : user })
    return user.SockID
}

module.exports =
{
      Save          : Save
    , Get           : Get
    , NearbyAdmin   : NearbyAdmin
    , GetUserSockID : GetUserSockID
}