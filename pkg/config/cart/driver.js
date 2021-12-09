const { ObjectId } = require('mongodb')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db]
    , { Cart }     = require('./model')
    , Log         = require('../../system/log')

const Create      = async function (user_id)
{
    Log('create-cart', { User: user_id })
    
    const resp = await db.cart.Get(user_id, Model.query.ByUserID )
    if(resp)
    {
      Log('cart-exists', { Cart: resp })
      return resp._id
    }

    data_     = new Cart(user_id)
    data_._id = new ObjectId()

    await db.cart.Save(data_)
    return data_._id
}

const Read        = async function (user_id)
{
  Log('read-cart', { UserID : user_id })
  const items = await db.cart.Read(user_id)
  let data    =
  {
      Flagged       : items.Flagged
    , Products      : items.Products
    , JournalID     : items.JournalID
    , StoreID       : items.StoreID
  }
  return data
}

const Delete      = async function (user_id)
{
  Log('delete-cart', { UserID: user_id })
  db.cart.Delete(user_id)
}

const Flush       = async function(user_id)
{
  Log('flush-cart', { UserID : user_id })

  let cart       = await db.cart.Get(user_id, Model.query.ByUserID)
  if (!cart)
  {
    Log('cart-not-found', { UserID : user_id })
    Model.Err_(Model.code.BAD_REQUEST, Model.reason.CartNotFound)
  } 

  let items = []
  cart.Products.forEach((prod)=>
  {
      items.push(
      {
          ProductID : prod.ProductID
        , Quantity  : prod.Quantity
      })
  })
  await db.product.DecProdCount(items)

  cart.JournalID   = ''
  cart.Products    = []
  
  await db.cart.Save(cart)
}

const Insert     = async function (cart_id, data)
{
  Log('insert-product', {
      CartID: cart_id
    , Product: data })

  data._id = ObjectId(data.ProductID)

  await db.cart.Insert(cart_id, data)
}

const Update     = async function (data)
{
    Log('update-product', data)

    await db.cart.Update(data)
}

const Remove  = async function (cart_id, product_id)
{
  Log('remove-product', { 
      CartID    : cart_id
    , ProductID : product_id })

  await db.cart.Remove(cart_id, product_id)
}

module.exports = 
{ 
  Create, Read,
  Delete, Flush,
  Insert, Update,
  Remove
}