const { ObjectID, ObjectId }        = require("mongodb")
    , { Product }                   = require("./product")
    , { carts }                     = require("./connect")
    , { Err, code, status, reason } = require("../common/error")

function Cart(user_id)
{
   this._id         = ''
   this.UserID      = user_id
   this.Products    = []    
   this.Bill        = 
   {
         Total           : 0
       , TransitCost     : 0
       , Tax             : 0
       , NetPrice        : 0
   }

   this.Set(data)
   {
      this._id       = data._id
      this.UserID    = data.UserID
      this.Products  = data.Products
   }

   this.Save       = async function()
   {
       console.log('save-cart', this)
       const   query = { _id : this._id }
              , act   = { $set : this }
              , opt   = { upsert : true }
       const resp  = await users.updateOne(query, act, opt)
       if (resp.modifiedCount !== 1) 
       {
           console.log('save-cart-failed', this)
           const   code_   = code.INTERNAL_SERVER
                 , status_ = status.Failed
                 , reason_ = reason.DBAdditionFailed
          throw new Err(code_, status_, reason_)
       }
   }

   this.GetByIDAndUserID = function(_id, user_id)
   {
      console.log(`find-cart-by-id. ID: ${_id}`)
      const query = { _id: ObjectId(_id), UserID: ObjectId(user_id) }
      let cart = await carts.findOne(query)
      if (!cart)
      {
        console.log(`cart-not-found. ID: ${query}`)
        return
      }
      this.Set(cart)
      console.log(`cart-found. cart: ${cart}`)
      return cart
   }

   this.Create      = function ()
   {
        this._id        = new ObjectID()
        const resp = await carts.insertOne(this);
        if (resp.insertedCount !== 1)
        {
            console.log('cart-addition-failed', this)
            const   code_  = code.INTERNAL_SERVER
                  , status_= status.Failed
                  , reason_= reason.DBAdditionFailed
            throw new Err(code_, status_, reason_)
        }
        console.log('cart-added', this)
        return this._id
   }

   this.Read        = function (data)
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
      let cart = this.GetByIDAndUserID(ObjectId(data.CartID), ObjectId(data.UserID))
      if (!cart)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.CartNotFound
        throw new Err(code_, status_, reason_)
      }

      this.Products.forEach(item => 
      {
        const product_ = new Product()
        const product = product_.GetByID(item.ProductID)
        if (!product)
        {
          const   code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.ProductNotFound
          throw new Err(code_, status_, reason_)
        }

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
        // --TODO--
        // Calculate rest of the Bill attrs
        // and shipmeent cost

      })
      data.Bill.NetPrice = data.Bill.Total // till algo get harderns
      console.log('cart-read', data)
      return data
   }

   this.Delete      = function (Id, user_id)
   {
        const query = {_id : ObjectId(Id), UserID: ObjectId(user_id)}
        const resp  = await carts.deleteOne(query);
        if (resp.deletedCount !== 1)
        {
            console.log('cart-deletion-failed', query)
            const   code_  = code.INTERNAL_SERVER
                  , status_= status.Failed
                  , reason_= reason.DBDeletionFailed
            throw new Err(code_, status_, reason_)
        }
        console.log('cart-deleted', query)
   }

   this.Flush       = function(Id)
   {
      let cart = this.GetByID(ObjectId(Id))
      if (!cart)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.CartNotFound
        throw new Err(code_, status_, reason_)
      }
      this.Products    = []    
      this.Bill        = 
      {
            Total           : 0
          , TransitCost    : 0
          , Tax             : 0
          , NetPrice        : 0
      }
      this.Save()
   }
}

function CartEntry(data)
{
   this._id         = ''
   this.ProductsID  = data.ProductsID
   this.StoreID     = data.StoreID
   this.Quantity    = data.Quantity

  this.Insert     = function (cart_id)
  {
    this._id    = new ObjectID()
    const query = { _id: cart_id              }
        , opts  = { $push: { Products: this } }

    const resp  = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-insertion-failed', this)
        throw new Err(code.INTERNAL_SERVER,
                      status.Failed,
                      reason.DBInsertionFailed)
    }
    console.log('product-inserted', query, opts)
  }

  this.Update     = function (cart_id, entry_id, qnty)
  {
    const   query = { _id: cart_id, 'Products._id': entry_id }
          , opts  = { $set: { 'Products.$.Quantity': qnty }  }

    const resp  = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-update-failed', this)
        throw new Err(code.INTERNAL_SERVER,
                      status.Failed,
                      reason.DBUpdationFailed)
    }
    console.log('product-updated', query, opts)
  }

  this.Remove     = function (cart_id, entry_id)
  {
    const   query = { _id: cart_id                         }
          , opts  = { $pull: { Products: {_id: entry_id} } }

    const resp  = await carts.updateOne(query, opts)
    if (resp.modifiedCount !== 1) 
    {
        console.log('product-removal-failed', this)
        throw new Err(code.INTERNAL_SERVER,
                      status.Failed,
                      reason.DBRemovalFailed)
    }
    console.log('product-removed', query, opts)
  }
}

module.exports = 
{
      CartEntry : CartEntry
    , Cart      : Cart
}