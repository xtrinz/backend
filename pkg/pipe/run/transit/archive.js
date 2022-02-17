const { ObjectId } = require('mongodb')
    , { db }       = require('../../../sys/database')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')

const Get = async function(param, qType)
{
    Log('find-transit', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case Model.query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.Custom : query_ = param                    ; break;
    }
    let transit = await db().transits.findOne(query_)
    if (!transit)
    {
        Log('transit-not-found', { Query : query_, Type : qType })
        return
    }
    Log('transit-found', { Transits: transit })
    return transit
}

const Save       = async function(data, upsert)
{
    Log('save-transit', { Transit: data })
    const key  = { _id    : data._id, State: data.Return }
        , act  = { $set   : data     }
        , opt  = { upsert : upsert   }
        , resp = await db().transits.updateOne(key, act, opt)
    if (!resp.acknowledged)
    {
        Log('transit-save-failed',
        { 
              Key       : key
            , Action    : act
            , Option    : opt
            , Result: resp.result
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('transit-saved', { Transit: data })
}

module.exports = { Get, Save }