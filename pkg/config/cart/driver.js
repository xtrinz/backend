const { ObjectID, ObjectId }  = require('mongodb')
    , { Err_, code , reason } = require('../../common/error')
    , { query }               = require('../../common/models')
    , db                      = require('../cart/archive')

function Cart(user_id)
{
   if(user_id)
   this.Data = 
   {
      _id         : ''
    , UserID      : ObjectId(user_id)
    , Products    : []
    , JournalID   : ''
   }

   this.Create      = async function ()
   {
        console.log('create-cart', { Cart: this.Data })
        
        const resp = await db.Get(this.Data.UserID
                                , query.ByUserID )
        if(resp)
        {
          console.log('cart-exists', { Cart: resp })
          return resp._id
        }

        this.Data._id = new ObjectID()
        await db.Save(this.Data)
        return this.Data._id
   }

   this.Read        = async function (user_id)
   {
      console.log('read-cart', { UserID : user_id })
      const items = await db.Read(user_id)
      let data    =
      {
          Flagged       : items.Flagged
        , Products      : items.Products //{ProductID,Name,Price,Image,CategoryID,Quantity,Available,Flagged}
        , JournalID     : items.JournalID
        , StoreID       : items.StoreID
      }
      return data
   }

   this.Delete      = async function (user_id)
   {
      console.log('delete-cart', { UserID: user_id })
      db.Delete(user_id)
   }

   this.Flush       = async function(user_id)
   {
      console.log('flush-cart', { UserID : user_id })

      let cart       = await db.Get(user_id, query.ByUserID)
      if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)

      cart.JournalID   = ''
      cart.Products    = []
      
      await db.Save(cart)
   }
}

function CartEntry(data)
{
   if(data)
   this.Data = 
   {
        _id         : ''
      , ProductID   : ObjectId(data.ProductID)
      , StoreID     : ObjectId(data.StoreID)
      , Quantity    : data.Quantity
   }

  this.Insert     = async function (cart_id)
  {
    console.log('insert-product', {
        CartID: cart_id
      , Product: this.Data })

    this.Data._id = ObjectId(this.Data.ProductID)

    await db.Insert(cart_id, this.Data)
  }

  this.Update     = async function (cart_id, product_id, qnty)
  {
    console.log('update-product', { 
        CartID    : cart_id
      , ProductID : product_id
      , Quantity  : qnty })

    await db.Update(cart_id, product_id, qnty)
  }

  this.Remove  = async function (cart_id, product_id)
  {
    console.log('remove-product', { 
        CartID    : cart_id
      , ProductID : product_id })

    await db.Remove(cart_id, product_id)
  }
}

module.exports = 
{
      CartEntry : CartEntry
    , Cart      : Cart
}