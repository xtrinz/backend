const { ObjectID, ObjectId } = require('mongodb')
    , { Err_, code , reason
    ,   query }              = require('../../system/models')
    , Model                  = require('../../system/models')
    , db                     = require('../exports')[Model.segment.db]

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
        
        const resp = await db.cart.Get(this.Data.UserID
                                , query.ByUserID )
        if(resp)
        {
          console.log('cart-exists', { Cart: resp })
          return resp._id
        }

        this.Data._id = new ObjectID()
        await db.cart.Save(this.Data)
        return this.Data._id
   }

   this.Read        = async function (user_id)
   {
      console.log('read-cart', { UserID : user_id })
      const items = await db.cart.Read(user_id)
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
      db.cart.Delete(user_id)
   }

   this.Flush       = async function(user_id)
   {
      console.log('flush-cart', { UserID : user_id })

      let cart       = await db.cart.Get(user_id, query.ByUserID)
      if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)

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

    await db.cart.Insert(cart_id, this.Data)
  }

  this.Update     = async function (cart_id, product_id, qnty)
  {
    console.log('update-product', { 
        CartID    : cart_id
      , ProductID : product_id
      , Quantity  : qnty })

    await db.cart.Update(cart_id, product_id, qnty)
  }

  this.Remove  = async function (cart_id, product_id)
  {
    console.log('remove-product', { 
        CartID    : cart_id
      , ProductID : product_id })

    await db.cart.Remove(cart_id, product_id)
  }
}

module.exports = 
{
      CartEntry : CartEntry
    , Cart      : Cart
}