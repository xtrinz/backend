const { db }        = require('../../../sys/database')
    , Model         = require('../../../sys/models')
    , { ObjectId }  = require('mongodb')
    , Log          = require('../../../sys/log')

const Save       = async function(data)
{
    Log('save-arbiter', { Arbiter: data })
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await db().arbiters.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('arbiter-save-failed', { Arbiter: data, Result: resp.result})
        Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('arbiter-saved', { Arbiter : data })
}

const Get = async function(param, qType)
{
    Log('find-arbiter', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case Model.query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case Model.query.ByMail     : query_ = { Email: param }         ; break;
    }
    let arbiter = await db().arbiters.findOne(query_)
    if (!arbiter)
    {
        Log('arbiter-not-found', { Query : query_ })
        return
    }
    Log('arbiter-found', { Arbiter: arbiter })
    return arbiter
}

const Nearby = async function(ln, lt)
{
    ln = ln.loc()
    lt = lt.loc()

    Log('get-nearest-arbiter', {Location: [ln, lt]} )
    const proj    = { projection: { _id: 1, Name: 1, MobileNo: 1 } }
        , query   =
        { 
            Location  :
            {
                $near : { $geometry    : { type: 'Point', coordinates: [ln, lt] } }
            }
            , Mode    : Model.mode.Arbiter
        }

    const arbiter_ = await db().arbiters.findOne(query, proj)
    if (!arbiter_)
    {
        Log('arbiter-not-found', { Location: [ln, lt]})
        return
    }
    arbiter_.ID = arbiter_._id
    delete arbiter_._id
    Log('arbiter-found', { Arbiter: arbiter_ })
    return arbiter_
}

module.exports = { Save , Get , Nearby }