const { db }       = require('../../../sys/database')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')
    , { ObjectId } = require('mongodb')

const Save       = async function(data)
{
    Log('save-agent', { Agent: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await db().agents.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('agent-save-failed', 
        { Agent: data, Result: resp.result})

        Model.Err_(Model.code.INTERNAL_SERVER
                 , Model.reason.AdditionFailed)
    }
    Log('agent-saved', { Agent : data })
}

const Get = async function(param, qType)
{
    Log('find-agent', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case Model.query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case Model.query.ByMail     : query_ = { Email: param }         ; break;
    }
    let agent = await db().agents.findOne(query_)
    if (!agent)
    {
        Log('agent-not-found', { Query : query_ })
        return
    }
    Log('agent-found', { Agent: agent })
    return agent
}

const Nearby = async function(ln, lt)
{
    ln = ln.loc()
    lt = lt.loc()
    let date_ = new Date()

    Log('list-nearby-live-agents', {Location: [ln, lt]} )
    const maxDist = 5000
        , proj    = { projection: { _id: 1, Name: 1, MobileNo: 1 } }
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
            , 'Status.Current'     : Model.states.OnDuty
            , 'Status.SetOn.Day'   : date_.getDate()
            , 'Status.SetOn.Month' : date_.getMonth()
            , 'Status.SetOn.Year'  : date_.getFullYear()
        }
    const agent_ = await db().agents.findOne(query, proj)
    if (!agent_)
    {
        Log('no-agent-found', { Location: [ln, lt]})
        return
    }
    agent_.ID = agent_._id
    delete agent_._id
    Log('agent-found', { Agent: agent_})
    return agent_
}

const List = async function(data, proj)
{
    data.Limit  = data.Limit.loc()
    data.Page   = data.Page.loc()
    const query = data.Query
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > Model.dbset.Limit)? Model.dbset.Limit : data.Limit

    const data_ = await db().agents.find(query, proj)
                              .skip(skip)
                              .limit(lmt)
                              .toArray()
    if (!data_.length && data.Page === 1)
    {
        Log('no-near-by-agents', { Query : query })
        return data_
    }

    Log('near-by-agents', { Agents: data_ })
    return data_
}

module.exports =
{
      Save, Get
    , List, Nearby
}