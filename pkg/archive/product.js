const { ObjectId }           = require('mongodb')
    , { Err_, code, reason } = require('../common/error')
    , { query }              = require('../common/models')
    , { products }           = require('./database')

const Save      = async function(data)
{
    console.log('save-product', data)
    const key   = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await products.updateOne(key, act, opt)

    if (!resp.result.ok)
    {
        console.log('product-save-failed', { 
            Key         : key
            , Action    : act
            , Options   : opt
            , Result    : resp.result })

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('product-saved', { Product : data })
}

const Get        = async function(param, qType)
{
    console.log('find-product', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case query.Custom : query_ = param                    ; break;
    }
    let product = await products.findOne(query_)
    if (!product)
    {
        console.log('product-not-found', { Query: query_, Type: qType })
        return
    }
    console.log('product-found', { Product: product })
    return product
}


const ReadAll         = async function (store_id)
{
    console.log('find-all-product-by-store-id', { StoreID: store_id })    
    const project   =
        {
            _id         : 1, StoreID    : 1,
            Name        : 1, Image      : 1,
            Price       : 1, Quantity   : 1,
            Description : 1, CategoryID : 1 
        }
        , query     = { StoreID: ObjectId(store_id) }
        , products_ = await products.find(query).project(project).toArray()
    if (!products_.length)
    {
        console.log('no-product-found', { Query : query, Project: project })
        return
    }
    console.log('products-found', { Products : products_ })
    return products_
}

const Remove      = async function (data)
{
    const query = 
    {
        StoreID : ObjectId(data.StoreID), 
        _id     : ObjectId(data.ProductID)
    }
    const resp  = await products.deleteOne(query);
    if (resp.deletedCount !== 1)
    {
        console.log('product-deletion-failed', query)
        Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
    }
    console.log('product-deleted', query)
}

module.exports = 
{
      Save    : Save
    , Get     : Get
    , ReadAll : ReadAll
    , Remove  : Remove
}