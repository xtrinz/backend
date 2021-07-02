const { users }             = require('../common/database')
    , { query, mode }       = require('../common/models')
    , { Err_, code, reason} = require('../common/error')
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
        case query.ByID    : query_ = { _id: ObjectId(param) } ; break;
        case query.ByMobileNo : query_ = { MobileNo: param }         ; break;
        case query.ByMail  : query_ = { Email: param }         ; break;
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
    /* Agent { _id, Name, SocketID }, count <=10,
        Nearest, Live, Radius < 5km             */
    // TODO Not participted in any activities currelty           
    const cnt     = 10
        , maxDist = 5000
        , proj    = { _id: 1, Name: 1, SockID: 1 }
        , query   =
        { 
/*              Location  :
            {
            $near :
            {
                $geometry    : { type: 'Point', coordinates: [ln, lt] }
            , $maxDistance : maxDist
            }
            }*/
                IsLive  : true
            , Mode    : mode.Agent
        }
    const agents = await users.find(query).project(proj).limit(cnt).toArray()
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
    /* Admin { _id, Name, SocketID }, count <=5,
        Nearest, Radius < 5km             */
    // TODO Not participted in any activities currelty
    const cnt     = 5
        , proj    = { _id: 1, Name: 1, SockID: 1 }
        , query   =
        { 
            /*Location  :
            {
                $near : { $geometry    : { type: 'Point', coordinates: [ln, lt] } }
            }*/
                Mode    : mode.Admin
        }
    const admins = await users.find(query).project(proj).limit(cnt).toArray()
    console.log('admins-filtered', { Admin: admins})
    return admins
}

const GetMany = async function(id_lst, proj)
{
    if(!id_lst.length)
    {
        console.log('empty-user-id-list',
        {     IDList       : id_lst
           , Projection    : proj })
        return []
    }

    id_lst = id_lst.map(ObjectId)
    const key  = { '_id' : { $in: id_lst } }
        , resp = await users.find(key).project(proj).toArray()

    if (!resp.length)
    {
        console.log('find-users-failed',
        { 
            Key        : key, 
            Projection : proj,
            Result     : resp.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    resp.forEach((res) => { delete res._id })
    console.log('users-list', { Stores: resp })
    return resp
}

module.exports =
{
      Save         : Save
    , Get          : Get
    , NearbyAgents : NearbyAgents
    , NearbyAdmins : NearbyAdmins
    , GetMany      : GetMany
}