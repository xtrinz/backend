const { ObjectId }          = require('mongodb')
    , { stores }            = require('./database')
    , { Err_, code, reason} = require('../common/error')
    , { query }             = require('../common/models')

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

const ListNearby = async function(PageNo, Lon, Lat)
{
    const nPerPage = 30
        , skip     = PageNo > 0 ? (PageNo - 1) * nPerPage : 0
        , query    = { Location: { $near: { $geometry: { type: 'Point', coordinates: [Lon, Lat] } } } }

    const data     = await stores.find(query).skip(skip).limit(nPerPage).toArray()
    if (!data.length && pageno == 1)
    {
        console.log('no-near-by-stores', { Query : query })
        return data
    }

    console.log('near-by-stores', { Stores: data })
    return data
}

const GetMany = async function(id_lst, proj)
{
    if(!id_lst.length)
    {
        console.log('empty-store-id-list',
        {     IDList       : id_lst
           , Projection    : proj })
        return []
    }

    id_lst = id_lst.map(ObjectId)
    const key  = { '_id' : { $in: id_lst } }
        , resp = await stores.find(key).project(proj).toArray()

    if (!resp.length && id_lst.length)
    {
        console.log('find-stores-failed',
        { 
            Key        : key, 
            Projection : proj,
            Result     : resp.result
        })
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    resp.forEach((res) => { res.StoreID = res._id; delete res._id })
    console.log('store-list', { Stores: resp })
    return resp
}

module.exports =
{
      Save       : Save
    , Get        : Get
    , ListNearby : ListNearby
    , GetMany    : GetMany
}