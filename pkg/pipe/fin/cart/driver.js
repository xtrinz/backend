const { ObjectId } = require('mongodb')
    , Model        = require('../../../sys/models')
    , db           = require('../../exports')[Model.segment.db]
    , Log          = require('../../../sys/log')
    , { Cart }     = require('./model')

const Create      = async function (client_id)
{
    Log('create-cart', { Client: client_id })
    
    const resp = await db.cart.Get(client_id, Model.query.ByClientID )
    if(resp)
    {
      Log('cart-exists', { Cart: resp })
      return resp._id
    }

    data_     = new Cart(client_id)
    data_._id = new ObjectId()

    await db.cart.Save(data_)
    return data_._id
}

const Read        = async function (client_id)
{
  Log('read-cart', { ClientID : client_id })
  const items = await db.cart.Read(client_id)
  let data    =
  {
      Flagged       : items.Flagged
    , Products      : items.Products
    , JournalID     : items.JournalID
    , SellerID       : items.SellerID
  }
  return data
}

const Delete      = async function (client_id)
{
  Log('delete-cart', { ClientID: client_id })
  db.cart.Delete(client_id)
}

const Flush       = async function(client_id)
{
  Log('flush-cart', { ClientID : client_id })

  let cart       = await db.cart.Get(client_id, Model.query.ByClientID)
  if (!cart)
  {
    Log('cart-not-found', { ClientID : client_id })
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