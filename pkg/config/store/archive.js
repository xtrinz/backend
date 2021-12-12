const { ObjectId } = require('mongodb')
    , { db }   = require('../../system/database')
    , Model        = require('../../system/models')
    , Log          = require('../../system/log')

const Save       = async function(data)
{
    Log('save-store', data)
    const query = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }

    const resp  = await db().stores.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('store-save-failed',
        { 
              Query     : query
            , Action    : act
            , Option    : opt
            , Result    : resp.result
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    Log('store-saved', { Store : data })
}

const Get = async function(param, qType)
{
    Log('find-store', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case Model.query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.ByMobileNo : query_ = { MobileNo: param }  ; break;        
        case Model.query.Custom : query_ = param                    ; break;
    }
    let store = await db().stores.findOne(query_)
    if (!store)
    {
        Log('store-not-found', {Query : query_, Type: qType })
        return
    }
    Log('store-found', { Sotre: store })
    return store
}

const List = async function(data, proj)
{
    data.Limit  = data.Limit.loc()
    data.Page   = data.Page.loc()
    const query = data.Query
        , skip  = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt   = (data.Limit > Model.dbset.Limit)? Model.dbset.Limit : data.Limit

    const data_ = await db().stores.find(query, proj)
                              .skip(skip)
                              .limit(lmt)
                              .toArray()
    if (!data_.length && data.Page === 1)
    {
        Log('no-near-by-stores', { Query : query })
        return data_
    }

    Log('near-by-stores', { Stores: data_ })
    return data_
}

const SockID = async function(store_id)
{
    Log('get-store-sock-id', { StoreID: store_id })

    const query = { _id: ObjectId(store_id), IsLive: true }

    let store = await db().stores.findOne(query)
    if(!store)
    {
        Log('store-not-found', query)
        return []
    }
    Log('store-found', { User : store })
    return store.SockID
}

const Location = async function(store_id)
{
    Log('get-store-location', { StoreID: store_id })

    store_ = await Get(store_id, Model.query.ByID)
    if (!store_) Model.Err_(Model.code.BAD_REQUEST, Model.reason.StoreNotFound)
    let data =
    {
        Longitude : store_.Address.Location.coordinates[0].toFixed(6)
      , Latitude  : store_.Address.Location.coordinates[1].toFixed(6)
    }

    Log('store-location-found', { StoreID: store_id, Loc : data })
    return data
}

module.exports =
{
      Save     , Get    
    , List     , SockID   
    , Location   
}