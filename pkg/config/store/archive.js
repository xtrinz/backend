const { ObjectId }          = require('mongodb')
    , { stores }            = require('../../common/database')
    , { Err_, code, reason} = require('../../common/error')
    , { query }             = require('../../common/models')

const Save       = async function(data)
{
    console.log('save-store', data)
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }

    const resp  = await stores.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('store-save-failed',
        { 
              Query     : query
            , Action    : act
            , Option    : opt
            , Result    : resp.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('store-saved', { Store : data })
}

const Get = async function(param, qType)
{
    console.log('find-store', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case query.Custom : query_ = param                    ; break;
    }
    let store = await stores.findOne(query_)
    if (!store)
    {
        console.log('store-not-found', {Query : query_, Type: qType })
        return
    }
    console.log('store-found', { Sotre: store })
    return store
}

const Nearby = async function(data, proj)
{
    const query = { Location: { $near: { $geometry: { type: 'Point', coordinates: [Lon, Lat] } } } }
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > dbset.Limit)? dbset.Limit : data.Limit

    const data     = await stores.find(query, proj)
                                 .skip(skip)
                                 .limit(lmt)
                                 .toArray()
    if (!data.length && data.Page == 1)
    {
        console.log('no-near-by-stores', { Query : query })
        return data
    }

    console.log('near-by-stores', { Stores: data })
    return data
}

module.exports =
{
      Save   : Save
    , Get    : Get
    , Nearby : Nearby
}