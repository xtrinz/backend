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
    if (!resp.result.ok)
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

const NearbyAgents = async function(ln, lt)
{
    console.log('list-nearby-live-agents', {Location: [ln, lt]} )
    const cnt     = 10
        , maxDist = 5000
        , proj    = { projection: { _id: 1, Name: 1, SockID: 1 } }
        , query   =
        { 
              Location  :
            {
                $near : { $geometry    : 
                    { 
                          type: 'Point'
                        , coordinates: [ln, lt] 
                    }
                    , $maxDistance : maxDist }
            }
            , IsLive  : true
            , Mode    : mode.Agent
        }
    const agents = await users.find(query, proj)
                              .limit(cnt)
                              .toArray()
    if (!agents.length)
    {
        console.log('no-agents-found', { Location: [ln, lt]})
        return
    }
    console.log('agents-found', { Agents: agents})
    return agents
}

const NearbyAdmins = async function(ln, lt)
{
    console.log('list-nearby-admins', {Location: [ln, lt]})
    const cnt     = 5
        , proj    = { projection: { _id: 1, Name: 1, SockID: 1 } }
        , query   =
        { 
            Location  :
            {
                $near : { $geometry    : { type: 'Point', coordinates: [ln, lt] } }
            }
            , Mode    : mode.Admin
        }
    const admins = await users.find(query, proj)
                              .limit(cnt)
                              .toArray()
    console.log('admins-filtered', { Admin: admins})
    return admins
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
      Save                : Save
    , Get                 : Get
    , NearbyAgents        : NearbyAgents
    , NearbyAdmins        : NearbyAdmins
    , GetUserSockID       : GetUserSockID
}