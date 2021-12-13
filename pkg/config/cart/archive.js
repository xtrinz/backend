const { ObjectId }            = require('mongodb')
    , { db }               = require('../../system/database')
    , { Err_, code , reason
    , query, limits }         = require('../../system/models')
    , prod                    = require('../product/archive')
    , Log                    = require('../../system/log')

const Save       = async function(data)
{
    const key   = { _id : data._id }
        , act   = { $set : data    }
        , opt   = { upsert : true  }
    const resp  = await db().carts.updateOne(key, act, opt)
    if (!resp.acknowledged)
    {
        Log('cart-save-failed',
        { Key: key, Action: act, Option: opt, Result: resp.result})
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    Log('cart-saved', { Cart: data })
}

const Get = async function(id, mode)
{
  Log('find-cart',{ ID: id, Mode: mode})

  let key
  if (mode === query.ByUserID)  { key = { UserID : ObjectId(id) } }
  if (mode === query.ByID)      { key = { _id    : ObjectId(id) } }

  let cart = await db().carts.findOne(key)
  if (!cart)
  {
    Log('cart-not-found', {Query: key})
    return
  }
  Log('cart-found', { Cart: cart})
  return cart
}

const Read        = async function (user_id)
{

  let cart = await Get(user_id, query.ByUserID)
  if (!cart)
  {
    Log('fatal-error-cart-not-found', { UserID: user_id })
    Err_(code.BAD_REQUEST, reason.CartNotFound)
  }

  let data = 
  {
      Products  : []
    , Flagged   : false
    , StoreID   : ''
    , JournalID : cart.JournalID 
  }

  for (let i = 0; i < cart.Products.length; i++)
  {
    const item    = cart.Products[i]
        , product = await prod.Get(item.ProductID, query.ByID)

    if (!product) 
    {
      Log('fatal-error-item-not-found', { ProductId : ProductID, UserID: user_id, Cart: cart }) // TODO handle properly
      Err_(code.BAD_REQUEST, reason.ProductNotFound)
    }

    let flag      = false
    if (item.Quantity > product.Quantity || !product.IsAvailable)
    { flag = true ; data.Flagged = true }

    const node = 
    {
        ProductID  : item.ProductID
      , Name       : product.Name
      , Price      : product.Price
      , Image      : product.Image
      , Category   : product.Category
      , Quantity   : item.Quantity
      , Available  : product.Quantity
      , Flagged    : flag
    }
    data.Products.push(node)
    data.StoreID = product.StoreID
  }

  Log('cart-read', data)
  return data
}

const Delete      = async function (user_id)
{
    const key   = { UserID: ObjectId(user_id) }
        , resp  = await db().carts.deleteOne(key);
    if (resp.deletedCount !== 1)
    {
        Log('cart-deletion-failed', { Key: key})
        Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
    }
    Log('cart-deleted', { Key : key })
}


const Insert     = async function (cart_id, data)
{
  const key2  =
    { 
      _id                : ObjectId(cart_id),
      $and               :
      [
        { 'Products.StoreID' : { $exists: true }},
        { 'Products.StoreID' : { $not : { $eq : data.StoreID } } }
      ]
    } // To Avoid multiple shop entry
    , act   = { $set : { Products : [] }    }
    , opt   = { upsert : false  }
  const resp2  = await db().carts.updateOne(key2, act, opt)
  if (!resp2.acknowledged)
  {
      Log('multi-store-purchase-clearance-failed',
      { Key: key2, Option: opt, Result: resp2.result})
      Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
  }

  const product_ = await prod.Get(data.ProductID, query.ByID)
  if (!product_)
  {
    Log('product-not-found-on-addn-to-cart', { Cart: cart_id, Data: data })
    Err_(code.BAD_REQUEST, reason.ProductNotFound)
  }
  if(!product_.IsAvailable  ||
      product_.Quantity < 1 ||
      data.Quantity > product_.Quantity)
  {
    Log('product-not-available-or-insufficient', { Cart: cart_id, Data: data, Product: product_ })
    Err_(code.BAD_REQUEST, reason.ProductUnavailable)
  }

  const key1  =
    { 
      _id                : ObjectId(cart_id),
      'Products._id'     : ObjectId(data.ProductID)
    }
  const resp1 = await db().carts.findOne(key1)
  if(resp1)
  {
    Log('product-exists-in-cart', { Key: key1 })
    Err_(code.CONFLICT, reason.ProductExists)
  }
  data._id   = ObjectId(data.ProductID)

  const key  = { _id : ObjectId(cart_id)}
      , opts = { $push: { Products: { $each: [ data ], $slice: limits.ProductCount }  } } 
      // TO-DO This shitf array on over flow, correct it with better methods 
      , resp = await db().carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      Log('product-insertion-failed', {Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
  }
  Log('product-inserted', { Product: data})
}

const Update     = async function (data)
{
  let cart_id = data.CartID
  let product_id = data.ProductID
  let is_inc = data.IsInc
  let qnty = is_inc ? 1 : -1

  let key1  = 
  {
    _id      : ObjectId(cart_id),
    Products : { $elemMatch: { _id : ObjectId(product_id) } }
  }
  let elem_ = await db().carts.findOne(key1)
  if (!elem_)
  {
      Log('prodcuct-not-found-at-cart-for-update', { Key: key1 })
      Err_(code.INTERNAL_SERVER, reason.ProductNotFound)
  }

  const product_ = await prod.Get(product_id, query.ByID)
  if (!product_)
  {
    Log('product-not-found-on-update-to-cart', { Cart: cart_id, ProductID: product_id, Quantity: qnty })
    Err_(code.BAD_REQUEST, reason.ProductNotFound)
  }

  if(!product_.IsAvailable  || product_.Quantity < 1 || (qnty + elem_.Quantity) > product_.Quantity )
  {
    Log('product-not-available-or-insufficient', { Cart: cart_id, Product: product_ })
    Err_(code.BAD_REQUEST, reason.ProductUnavailable)
  }

  const   key =
        {
          _id                 : ObjectId(cart_id),
          'Products._id'      : ObjectId(product_id),
          'Products.Quantity' : { $gt: -1 * qnty }
        }
        , opts  = { $inc: { 'Products.$.Quantity': qnty }  }

  const resp  = await db().carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      Log('product-update-failed', { Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
  }
  Log('product-updated', { Key: key, Option: opts })
}

const Remove  = async function (cart_id, product_id)
{
  const  key = { _id: ObjectId(cart_id) }
      , opts = { $pull: { Products: { _id: ObjectId(product_id) } } }

  const resp  = await db().carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      Log('product-removal-failed', { Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
  }
  Log('product-removed', { Key: key, Option: opts })
}


module.exports = 
{
    Save    , Get     
  , Read    , Delete
  , Insert  , Update
  , Remove
}