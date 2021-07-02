const { ObjectId }            = require('mongodb')
    , { carts }               = require('./database')
    , { Err_, code , reason } = require('../common/error')
    , { query }               = require('../common/models')
    , prod                    = require('./product')

const Save       = async function(data)
{
    const key   = { _id : data._id }
        , act   = { $set : data    }
        , opt   = { upsert : true  }
    const resp  = await carts.updateOne(key, act, opt)
    if (!resp.result.ok)
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
  if (!cart.Products.length) Err_(code.BAD_REQUEST, reason.NoProductsFound)

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
    if (item.Quantity > product.Quantity)
    { flag = true ; data.Flagged = true }

    const node = 
    {
        ProductID  : item.ProductID
      , Name       : product.Name
      , Price      : product.Price
      , Image      : product.Image
      , CategoryID : product.CategoryID
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
  const key1  =
  { 
    _id            : ObjectId(cart_id),
    'Products._id' : ObjectId(data.ProductID)
  }
  const resp1 = await carts.findOne(key1)
  if(resp1)
  {
    console.log('product-exists-in-cart', { Key: key })
    Err_(code.CONFLICT, reason.ProductExists)
  }
  data._id   = ObjectId(data.ProductID)

  const key  = { _id : ObjectId(cart_id)}
      , opts = { $push: { Products: data } }
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
  const   key =
        {
          _id           : ObjectId(cart_id),
          'Products._id': ObjectId(product_id)
        }
        , opts  = { $set: { 'Products.$.Quantity': qnty }  }

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

  , Insert : Insert
  , Update : Update
  , Remove : Remove
}