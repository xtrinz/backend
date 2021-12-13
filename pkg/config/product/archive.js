const { ObjectId }  = require('mongodb')
    , Model         = require('../../system/models')
    , { db }        = require('../../system/database')
    , project       = require('../../tools/project/product')
    , Log           = require('../../system/log')

const Save      = async function(data)
{
    Log('save-product', data)
    const key   = { _id    : data._id }
        , act   = { $set   : data }
        , opt   = { upsert : true }
    const resp  = await db().products.updateOne(key, act, opt)

    if (!resp.acknowledged)
    {
        Log('product-save-failed', 
        {
              Key     : key, Action : act
            , Options : opt, Result : resp.result 
        })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    Log('product-saved', { Product : data })
}

const Update      = async function(Id, act)
{
    Log('save-product', { ID: Id, Act: act })
    const key   = { _id    : Id }

    const resp  = await db().products.updateOne(key, act)
    if (!resp.acknowledged)
    {
        Log('product-save-failed', { 
            Key         : key
            , Action    : act
            , Result    : resp.result })

        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBAdditionFailed)
    }
    Log('product-saved', { ID: Id, Act: act })
}

const Get        = async function(param, qType)
{
    Log('find-product', { Param: param, QType: qType})
    let query_
    switch (qType)
    {
        case Model.query.ByID   : query_ = { _id: ObjectId(param) } ; break;
        case Model.query.Custom : query_ = param                    ; break;
    }
    let product = await db().products.findOne(query_)
    if (!product)
    {
        Log('product-not-found', { Query: query_, Type: qType })
        return
    }
    Log('product-found', { Product: product })
    return product
}


const ReadAll         = async function (data, mode_)
{
    data.Page  = data.Page.loc()
    data.Limit = data.Limit.loc()
    Log('find-all-product-by-store-id', { Data: data, Mode: mode_ })    
    const proj   = project[Model.verb.view]
        , query_  = data.Query
        , skip   = (data.Page > 0)? (data.Page - 1) * data.Limit : 0
        , lmt    = (data.Limit > Model.dbset.Limit)? Model.dbset.Limit : data.Limit

    if(mode_ === Model.mode.User) query_.Quantity = { $gt : 0 }

    const products_ = await db().products.find(query_)
                                    .project(proj)
                                    .skip(skip)
                                    .limit(lmt)
                                    .toArray()
    if (!products_.length)
    {
        Log('no-product-found', { Query : query_, Project: project })
        return products_
    }
    for(let idx = 0; idx < products_.length; idx++)
    {
        products_[idx].ProductID   = products_[idx]._id
        delete products_[idx]._id
    }
    Log('products-found', { Products : products_ })
    return products_
}

const DecProdCount         = async function (prod)
{
    Log('decrement-product-count', { Products: prod })
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
    const resp = await db().products.bulkWrite(qry_)
    if (!resp.acknowledged)
    {
        Log('product-count-decrement-failed', { Query : qry_ })
        return
    }
    Log('product-count-decremented', { Products : qry_[0].updateOne })
}

const IncProdCount         = async function (prod)
{
    Log('increment-product-count', { Products: prod })
    let qry_ = []
    prod.forEach((item)=>
    {
        qry_.push(
        { updateOne :
            {
               "filter": { _id: ObjectId(item.ProductID), IsAvailable: true },
               "update": { $inc : { Quantity: (item.Quantity) } }
            }
        })
    })
    const resp = await db().products.bulkWrite(qry_)
    if (!resp.acknowledged)
    {
        Log('product-count-increment-failed', { Query : qry_ })
        return
    }
    Log('product-count-incremented', { Products : qry_[0].updateOne })
}

const UpdateMany = async function (store_id, data)
{
    Log('update-products-in-a-store', { StoreID: store_id, Data: data })
    let qry_ = { StoreID : ObjectId(store_id) }
      , op   = { $set: data }

    const resp = await db().products.updateMany(qry_, op)
    if (!resp.acknowledged)
    {
        Log('product-updation-failed', { Query : qry_ })
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBUpdationFailed)
    }
    Log('products-updated', { StoreId: store_id, Data: data })
}

const Remove      = async function (data)
{
    const query_ = 
    {
        StoreID : ObjectId(data.Store._id), 
        _id     : ObjectId(data.ProductID)
    }
    const resp  = await db().products.deleteOne(query_);
    if (resp.deletedCount !== 1)
    {
        Log('product-deletion-failed', query_)
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBDeletionFailed)
    }
    Log('product-deleted', query_)
}

module.exports = 
{
      Save          , Get          , Update
    , ReadAll       , DecProdCount
    , IncProdCount  , UpdateMany   , Remove
}