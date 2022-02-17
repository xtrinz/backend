const { db }        = require('../../../sys/database')
    , Model         = require('../../../sys/models')
    , { ObjectId }  = require('mongodb')
    , Log           = require('../../../sys/log')

const Save       = async function(data)
{
    Log('save-client', { Client: data })
    const query_ = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await db().clients.updateOne(query_, act, opt)
    if (!resp.acknowledged)
    {
        Log('client-save-failed', { Client: data, Result: resp.result})
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('client-saved', { Client : data })
}

const Get = async function(param, qType)
{
    Log('find-client', { Param: param, QType: qType} )
    let query_
    switch (qType)
    {
        case Model.query.ByID       : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }      ; break;
        case Model.query.ByMail     : query_ = { Email: param }         ; break;
    }
    let client = await db().clients.findOne(query_)
    if (!client)
    {
        Log('client-not-found', { Query : query_ })
        return
    }
    Log('client-found', { Client: client })
    return client
}

module.exports = { Save, Get }