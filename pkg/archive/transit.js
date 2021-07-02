const { ObjectId }           = require('mongodb')
    , { transits } 	         = require('../common/database')
    , { Err_, code, reason } = require('../common/error')
    , { query }              = require('../common/models')

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

const Save       = async function(data)
{
    console.log('save-transit', { Transit: data })
    const key  = { _id    : data._id }
        , act  = { $set   : data     }
        , opt  = { upsert : true          }
        , resp = await transits.updateOne(key, act, opt)
    if (!resp.result.ok)
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

module.exports =
{
      Get  : Get
    , Save : Save
}