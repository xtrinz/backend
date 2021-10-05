const { ObjectId }           = require('mongodb')
    , { Err_, code, reason
    , query, dbset, mode }         = require('../../system/models')
    , { products }           = require('../../system/database')

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


const ReadAll         = async function (data, mode_)
{
    data.Page  = data.Page.loc()
    data.Limit = data.Limit.loc()
    console.log('find-all-product-by-store-id', { Data: data })    
    const project   =
        {
            _id         : 1, StoreID    : 1,
            Name        : 1, Image      : 1,
            Price       : 1, Quantity   : 1,
            Description : 1, CategoryID : 1 
        }
        , query     = { StoreID: ObjectId(data.StoreID) }
        , skip      = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt       = (data.Limit > dbset.Limit)? dbset.Limit : data.Limit

    if(mode_ === mode.User) query.Quantity = { $gt : 0 }

    const products_ = await products.find(query)
                                    .project(project)
                                    .skip(skip)
                                    .limit(lmt)
                                    .toArray()
    if (!products_.length)
    {
        console.log('no-product-found', { Query : query, Project: project })
        return
    }
    for(let idx = 0; idx < products_.length; idx++)
    {
        products_[idx].ProductID = products_[idx]._id
        delete products_[idx]._id
    }
    console.log('products-found', { Products : products_ })
    return products_
}

const DecProdCount         = async function (prod)
{
    console.log('decrement-product-count', { Products: prod })
    let qry_ = []
    prod.forEach((item)=>
    {
        qry_.push(
        { updateOne :
            {
               "filter": { _id: ObjectId(item.ProductID) },
               "update": { $inc : { Quantity: (-1 * item.Quantity) } }
            }
        })
    })
    const resp = await products.bulkWrite(qry_)
    if (!resp.result.ok)
    {
        console.log('product-count-decrement-failed', { Query : qry_ })
        return
    }
    console.log('product-count-decremented', { Products : qry_[0].updateOne })
}

const Remove      = async function (data)
{
    const query = 
    {
        StoreID : ObjectId(data.Store._id), 
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
      Save         : Save
    , Get          : Get
    , ReadAll      : ReadAll
    , DecProdCount : DecProdCount
    , Remove       : Remove
}