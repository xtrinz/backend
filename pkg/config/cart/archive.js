const { ObjectId }            = require('mongodb')
    , { carts }               = require('../../system/database')
    , { Err_, code , reason
    , query, limits }         = require('../../system/models')
    , prod                    = require('../product/archive')

const Save       = async function(data)
{
    const key   = { _id : data._id }
        , act   = { $set : data    }
        , opt   = { upsert : true  }
    const resp  = await carts.updateOne(key, act, opt)
    if (!resp.acknowledged)
    {
        console.log('cart-save-failed',
        { Key: key, Action: act, Option: opt, Result: resp.result})
        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('cart-saved', { Cart: data })
}

const Get = async function(id, mode)
{
  console.log('find-cart',{ ID: id, Mode: mode})

  let key
  if (mode === query.ByUserID)  { key = { UserID : ObjectId(id) } }
  if (mode === query.ByID)      { key = { _id    : ObjectId(id) } }

  let cart = await carts.findOne(key)
  if (!cart)
  {
    console.log('cart-not-found', {Query: key})
    return
  }
  console.log('cart-found', { Cart: cart})
  return cart
}

const Read        = async function (user_id)
{

  let cart = await Get(user_id, query.ByUserID)
  if (!cart)                 Err_(code.BAD_REQUEST, reason.CartNotFound)

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

    if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)

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

  console.log('cart-read', data)
  return data
}

const List        = async function (user_id)
{

  let cart = await Get(user_id, query.ByUserID)
  if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)

  let data = 
  {
      Products  : []
    , Flagged   : false
    , StoreID   : ''
    , HasCOD    : true
    , JournalID : cart.JournalID 
  }

  for (let i = 0; i < cart.Products.length; i++)
  {
    const item    = cart.Products[i]
        , product = await prod.Get(item.ProductID, query.ByID)

    if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)

    let flag      = false
    if (item.Quantity > product.Quantity || !product.IsAvailable)
    { flag = true ; data.Flagged = true }

    if(!product.HasCOD) data.HasCOD = false

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

  console.log('cart-read', data)
  return data
}

const Delete      = async function (user_id)
{
    const key   = { UserID: ObjectId(user_id) }
        , resp  = await carts.deleteOne(key);
    if (resp.deletedCount !== 1)
    {
        console.log('cart-deletion-failed', { Key: key})
        Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
    }
    console.log('cart-deleted', { Key : key })
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
  const resp2  = await carts.updateOne(key2, act, opt)
  if (!resp2.acknowledged)
  {
      console.log('multi-store-purchase-clearance-failed',
      { Key: key2, Option: opt, Result: resp2.result})
      Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
  }

  const product_ = await prod.Get(data.ProductID, query.ByID)
  if (!product_)
  {
    console.log('product-not-found-on-addn-to-cart', { Cart: cart_id, Data: data })
    Err_(code.BAD_REQUEST, reason.ProductNotFound)
  }
  if(!product_.IsAvailable  ||
      product_.Quantity < 1 ||
      data.Quantity > product_.Quantity)
  {
    console.log('product-not-available-or-insufficient', { Cart: cart_id, Data: data, Product: product_ })
    Err_(code.BAD_REQUEST, reason.ProductUnavailable)
  }

  const key1  =
    { 
      _id                : ObjectId(cart_id),
      'Products._id'     : ObjectId(data.ProductID)
    }
  const resp1 = await carts.findOne(key1)
  if(resp1)
  {
    console.log('product-exists-in-cart', { Key: key1 })
    Err_(code.CONFLICT, reason.ProductExists)
  }
  data._id   = ObjectId(data.ProductID)

  const key  = { _id : ObjectId(cart_id)}
      , opts = { $push: { Products: { $each: [ data ], $slice: limits.ProductCount }  } } 
      // TO-DO This shitf array on over flow, correct it with better methods 
      , resp = await carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      console.log('product-insertion-failed', {Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
  }
  console.log('product-inserted', { Product: data})
}

const Update     = async function (cart_id, product_id, qnty)
{
  let key1  = 
  {
    _id      : ObjectId(cart_id),
    Products : { $elemMatch: { _id : ObjectId(product_id) } }
  }
  let elem_ = await carts.findOne(key1)
  if (!elem_)
  {
      console.log('prodcuct-not-found-at-cart-for-update', { Key: key1 })
      Err_(code.INTERNAL_SERVER, reason.ProductNotFound)
  }

  const product_ = await prod.Get(product_id, query.ByID)
  if (!product_)
  {
    console.log('product-not-found-on-update-to-cart', { Cart: cart_id, ProductID: product_id, Quantity: qnty })
    Err_(code.BAD_REQUEST, reason.ProductNotFound)
  }

  if(!product_.IsAvailable  || product_.Quantity < 1 || (qnty + elem_.Quantity) > product_.Quantity )
  {
    console.log('product-not-available-or-insufficient', { Cart: cart_id, Product: product_ })
    Err_(code.BAD_REQUEST, reason.ProductUnavailable)
  }

  const   key =
        {
          _id                 : ObjectId(cart_id),
          'Products._id'      : ObjectId(product_id),
          'Products.Quantity' : { $gt: -1 * qnty }
        }
        , opts  = { $inc: { 'Products.$.Quantity': qnty }  }

  const resp  = await carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      console.log('product-update-failed', { Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
  }
  console.log('product-updated', { Key: key, Option: opts })
}

const Remove  = async function (cart_id, product_id)
{
  const  key = { _id: ObjectId(cart_id) }
      , opts = { $pull: { Products: { _id: ObjectId(product_id) } } }

  const resp  = await carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      console.log('product-removal-failed', { Key: key, Option: opts })
      Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
  }
  console.log('product-removed', { Key: key, Option: opts })
}


module.exports = 
{
    Save   : Save
  , Get    : Get
  , Read   : Read
  , Delete : Delete
  , List   : List

  , Insert : Insert
  , Update : Update
  , Remove : Remove
}