const { ObjectID, ObjectId }  = require("mongodb")
    , { Product }             = require("./product")
    , { carts }               = require("../common/database")
    , { Err_, code , reason } = require("../common/error")
    , { query }               = require("../common/models")

function Cart(user_id)
{
   if(user_id)
   this.Data = 
   {
      _id         : ''
    , UserID      : ObjectId(user_id)
    , Products    : []
    , JournalID   : ''    
    //, Bill : { Total : 0, TransitCost : 0, Tax : 0, NetPrice : 0 }
   }

   this.Save       = async function()
   {
       console.log('save-cart', this.Data)
       const key = { _id : this.Data._id }
           , act   = { $set : this.Data }
           , opt   = { upsert : true }
       const resp  = await carts.updateOne(key, act, opt)
       if (!resp.result.ok)
       {
           console.log('cart-save-failed', { Data: this.Data, Result: resp.result})
           Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
       }
       console.log('cart-saved', this.Data)
   }

   this.Get = async function(id, mode)
   {
      console.log('find-cart-by-user-id',{ ID: id, Mode: mode})
      let key
      if (mode === query.ByUserID){
        key = { UserID: ObjectId(id) }
      } else if (mode === query.ByID) {
        key = { _id: ObjectId(id) }
      }
      let cart = await carts.findOne(key)
      if (!cart)
      {
        console.log('cart-not-found', {Query: key})
        return
      }
      this.Data = cart
      console.log('cart-found', { cart: cart})
      return cart
   }

   this.Create      = async function ()
   {
        await this.Get(this.Data.UserID, query.ByUserID)
        if(!this.Data._id) this.Data._id = new ObjectID()
        const resp = await this.Save()
        console.log('cart-added', this.Data)
        return this.Data._id
   }

   this.Read        = async function (user_id)
   {
      let data =
      {
          Products: []
        , Bill    : 
        {
            Total           : 0
          , TransitCost     : 0
          , Tax             : 0
          , NetPrice        : 0
        }
      }
      let cart = await this.Get(user_id, query.ByUserID)
      if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)
      for (let i = 0; i < this.Data.Products.length; i++)
      {
        let item        = this.Data.Products[i]
        const product_  = new Product()
            , product   = await product_.Get(item.ProductID, query.ByID)
        if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)
        const node = 
        {
            ProductID : item.ProductID
          , Name      : product.Name
          , Price     : product.Price
          , Image     : product.Image
          , Quantity  : item.Quantity
        }
        data.Products.push(node)
        data.Bill.Total   += node.Price * node.Quantity
        data.Bill.NetPrice = data.Bill.Total
        // --TODO-- Calculate rest of the Bill attrs and shipmeent cost
      }
      console.log('cart-read', data)
      return data
   }

   this.Delete      = async function (user_id)
   {
        const key = {UserID: ObjectId(user_id)}
            , resp  = await carts.deleteOne(key);
        if (resp.deletedCount !== 1)
        {
            console.log('cart-deletion-failed', key)
            Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
        }
        console.log('cart-deleted', key)
   }

   this.Flush       = async function(UserId)
   {
      let cart = await this.Get(UserId, query.ByUserID)
      if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)
      this.Data.JournalID   = ''
      this.Data.Products    = []
      await this.Save()
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
    this.Data._id = ObjectId(this.Data.ProductID)
    const key   = { _id: ObjectId(cart_id)         }
        , opts    = { $push: { Products: this.Data } }
        , resp    = await carts.updateOne(key, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-insertion-failed', this.Data)
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    console.log('product-inserted', key, opts)
  }

  this.Update     = async function (cart_id, product_id, qnty)
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
        console.log('product-update-failed', this.Data)
        Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
    }
    console.log('product-updated', key, opts)
  }

  this.Remove     = async function (cart_id, product_id)
  {
    const   key = { _id: ObjectId(cart_id)                         }
          , opts  = { $pull: { Products: {_id: ObjectId(product_id)} } }

    const resp  = await carts.updateOne(key, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-removal-failed', this)
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    console.log('product-removed', key, opts)
  }
}

module.exports = 
{
      CartEntry : CartEntry
    , Cart      : Cart
}