const { agents }            = require('../../system/database')
    , { query, mode, dbset,
        Err_, code, reason} = require('../../system/models')
    , { ObjectId }          = require('mongodb')

const Save       = async function(data)
{
    console.log('save-agent', { Agent: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await agents.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('agent-save-failed', { Agent: data, Result: resp.result})
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('agent-saved', { Agent : data })
}

const Get = async function(param, qType)
{
    console.log('find-agent', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case query.ByMail     : query_ = { Email: param }         ; break;
    }
    let agent = await agents.findOne(query_)
    if (!agent)
    {
        console.log('agent-not-found', { Query : query_ })
        return
    }
    console.log('agent-found', { Agent: agent })
    return agent
}

const NearbyAgents = async function(ln, lt)
{
    ln = ln.loc()
    lt = lt.loc()    
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
    const agents_ = await agents.find(query, proj)
                              .limit(cnt)
                              .toArray()
    if (!agents_.length)
    {
        console.log('no-agents-found', { Location: [ln, lt]})
        return
    }
    console.log('agents-found', { Agents: agents_})
    return agents_
}

const List = async function(data, proj)
{
    data.Limit  = data.Limit.loc()
    data.Page   = data.Page.loc()
    const query = data.Query
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > dbset.Limit)? dbset.Limit : data.Limit

    const data_ = await agents.find(query, proj)
                              .skip(skip)
                              .limit(lmt)
                              .toArray()
    if (!data_.length && data.Page === 1)
    {
        console.log('no-near-by-agents', { Query : query })
        return data_
    }

    console.log('near-by-agents', { Agents: data_ })
    return data_
}

const GetAgentSockID = async function(agent_id)
{
    console.log('get-agent-sock-id', { AgentID: agent_id })

    const query = { _id: ObjectId(agent_id), IsLive: true }

    let agent = await agents.findOne(query)
    if(!agent)
    {
        console.log('agent-not-found', query)
        return []
    }
    console.log('agent-found', { Agent : agent })
    return agent.SockID
}

module.exports =
{
      Save                : Save
    , Get                 : Get
    , List                : List
    , NearbyAgents        : NearbyAgents
    , GetAgentSockID       : GetAgentSockID
}