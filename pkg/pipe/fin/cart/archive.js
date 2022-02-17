const { ObjectId } = require('mongodb')
    , { db }       = require('../../../sys/database')
    , Model        = require('../../../sys/models')
    , prod         = require('../product/archive')
    , Log          = require('../../../sys/log')

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
        Model.Err(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('cart-saved', { Cart: data })
}

const Get = async function(id, mode)
{
  Log('find-cart',{ ID: id, Mode: mode})

  let key
  if (mode === Model.query.ByClientID)  { key = { ClientID : ObjectId(id) } }
  if (mode === Model.query.ByID)      { key = { _id    : ObjectId(id) } }

  let cart = await db().carts.findOne(key)
  if (!cart)
  {
    Log('cart-not-found', {Query: key})
    return
  }
  Log('cart-found', { Cart: cart})
  return cart
}

const Read        = async function (client_id)
{

  let cart = await Get(client_id, Model.query.ByClientID)
  if (!cart)
  {
    Log('fatal-error-cart-not-found', { ClientID: client_id })
    Model.Err(Model.code.BAD_REQUEST, Model.reason.CartNotFound)
  }

  let data = 
  {
      Products  : []
    , Flagged   : false
    , SellerID   : ''
    , JournalID : cart.JournalID 
  }

  for (let i = 0; i < cart.Products.length; i++)
  {
    const item    = cart.Products[i]
        , product = await prod.Get(item.ProductID, Model.query.ByID)

    if (!product) 
    {
      Log('fatal-error-item-not-found', { ProductId : ProductID, ClientID: client_id, Cart: cart }) // TODO handle properly
      Model.Err(Model.code.BAD_REQUEST, Model.reason.ProductNotFound)
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
    data.SellerID = product.SellerID
  }

  Log('cart-read', data)
  return data
}

const Delete      = async function (client_id)
{
    const key   = { ClientID: ObjectId(client_id) }
        , resp  = await db().carts.deleteOne(key);
    if (resp.deletedCount !== 1)
    {
        Log('cart-deletion-failed', { Key: key})
        Model.Err(Model.code.INTERNAL_SERVER, Model.reason.DBDeletionFailed)
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
        { 'Products.SellerID' : { $exists: true }},
        { 'Products.SellerID' : { $not : { $eq : data.SellerID } } }
      ]
    } // To Avoid multiple shop entry
    , act   = { $set : { Products : [] }    }
    , opt   = { upsert : false  }
  const resp2  = await db().carts.updateOne(key2, act, opt)
  if (!resp2.acknowledged)
  {
      Log('multi-seller-purchase-clearance-failed',
      { Key: key2, Option: opt, Result: resp2.result})
      Model.Err(Model.code.INTERNAL_SERVER, Model.reason.DBUpdationFailed)
  }

  const product_ = await prod.Get(data.ProductID, Model.query.ByID)
  if (!product_)
  {
    Log('product-not-found-on-addn-to-cart', { Cart: cart_id, Data: data })
    Model.Err(Model.code.BAD_REQUEST, Model.reason.ProductNotFound)
  }
  if(!product_.IsAvailable  ||
      product_.Quantity < 1 ||
      data.Quantity > product_.Quantity)
  {
    Log('product-not-available-or-insufficient', { Cart: cart_id, Data: data, Product: product_ })
    Model.Err(Model.code.BAD_REQUEST, Model.reason.ProductUnavailable)
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
    Model.Err(Model.code.CONFLICT, Model.reason.ProductExists)
  }
  data._id   = ObjectId(data.ProductID)

  const key  = { _id : ObjectId(cart_id)}
      , opts = { $push: { Products: { $each: [ data ], $slice: Model.limits.ProductCount }  } } 
      // TO-DO This shitf array on over flow, correct it with better methods 
      , resp = await db().carts.updateOne(key, opts)
  if (resp.modifiedCount !== 1) 
  {
      Log('product-insertion-failed', {Key: key, Option: opts })
      Model.Err(Model.code.INTERNAL_SERVER, Model.reason.DBInsertionFailed)
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
      Model.Err(Model.code.INTERNAL_SERVER, Model.reason.ProductNotFound)
  }

  const product_ = await prod.Get(product_id, Model.query.ByID)
  if (!product_)
  {
    Log('product-not-found-on-update-to-cart', { Cart: cart_id, ProductID: product_id, Quantity: qnty })
    Model.Err(Model.code.BAD_REQUEST, Model.reason.ProductNotFound)
  }

  if(!product_.IsAvailable  || product_.Quantity < 1 || (qnty + elem_.Quantity) > product_.Quantity )
  {
    Log('product-not-available-or-insufficient', { Cart: cart_id, Product: product_ })
    Model.Err(Model.code.BAD_REQUEST, Model.reason.ProductUnavailable)
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
      Model.Err(Model.code.INTERNAL_SERVER, Model.reason.DBUpdationFailed)
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
      Model.Err(Model.code.INTERNAL_SERVER, Model.reason.DBRemovalFailed)
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