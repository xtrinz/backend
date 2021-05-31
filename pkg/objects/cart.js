const { ObjectID, ObjectId }  = require("mongodb")
    , { Product }             = require("./product")
    , { carts }               = require("../common/database")
    , { Err_, code , reason } = require("../common/error")
    , test                    = require('../common/test')
    , { query }               = require("../common/models")

function Cart(user_id)
{
   if(user_id)
   this.Data = 
   {
      _id         : ''
    , UserID      : ObjectId(user_id)
    , Products    : []    
    , Bill        : 
    {
         Total           : 0
       , TransitCost     : 0
       , Tax             : 0
       , NetPrice        : 0
    }
   }

   this.Save       = async function()
   {
       console.log('save-cart', this.Data)
       const query = { _id : this.Data._id }
           , act   = { $set : this.Data }
           , opt   = { upsert : true }
       const resp  = await carts.updateOne(query, act, opt)
       if (!resp.result.ok)
       {
           console.log('cart-save-failed', { Data: this.Data, Result: resp.result})
           Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
       }
       console.log('cart-saved', this.Data)
   }

   this.Get = async function(user_id)
   {
      console.log('find-cart-by-user-id',{ UserID: user_id})
      const query = { UserID: ObjectId(user_id) }
      let cart = await carts.findOne(query)
      if (!cart)
      {
        console.log('cart-not-found', {Query: query})
        return
      }
      this.Data = cart
      console.log('cart-found', { cart: cart})
      return cart
   }

   this.Create      = async function ()
   {
        await this.Get(this.Data.UserID)
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
      let cart = await this.Get(user_id)
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
        const query = {UserID: ObjectId(user_id)}
            , resp  = await carts.deleteOne(query);
        if (resp.deletedCount !== 1)
        {
            console.log('cart-deletion-failed', query)
            Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
        }
        console.log('cart-deleted', query)
   }

   this.Flush       = async function(UserId)
   {
      let cart = await this.Get(ObjectId(UserId))
      if (!cart) Err_(code.BAD_REQUEST, reason.CartNotFound)
      this.Data.Products    = []    
      this.Data.Bill        = 
      {
            Total           : 0
          , TransitCost     : 0
          , Tax             : 0
          , NetPrice        : 0
      }
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
    this.Data._id = new ObjectID()
    test.Set('EntryID', this.Data._id) // #101
    const query   = { _id: ObjectId(cart_id)         }
        , opts    = { $push: { Products: this.Data } }
        , resp    = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-insertion-failed', this.Data)
        Err_(code.INTERNAL_SERVER, reason.DBInsertionFailed)
    }
    console.log('product-inserted', query, opts)
  }

  this.Update     = async function (cart_id, entry_id, qnty)
  {
    const   query =
          {
            _id           : ObjectId(cart_id),
            'Products._id': ObjectId(entry_id)
          }
          , opts  = { $set: { 'Products.$.Quantity': qnty }  }

    const resp  = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-update-failed', this.Data)
        Err_(code.INTERNAL_SERVER, reason.DBUpdationFailed)
    }
    console.log('product-updated', query, opts)
  }

  this.Remove     = async function (cart_id, entry_id)
  {
    const   query = { _id: ObjectId(cart_id)                         }
          , opts  = { $pull: { Products: {_id: ObjectId(entry_id)} } }

    const resp  = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-removal-failed', this)
        Err_(code.INTERNAL_SERVER, reason.DBRemovalFailed)
    }
    console.log('product-removed', query, opts)
  }
}

module.exports = 
{
      CartEntry : CartEntry
    , Cart      : Cart
}