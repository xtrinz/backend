const { carts }                     = require("../connect")
const { Err, code, status, reason } = require("../common/error")
const { ObjectID, ObjectId }        = require("mongodb")
const { Product }                   = require("./product")
const { Store   }                   = require("./store")
const { Journal }                   = require("./journal")

function Cart(user_id)
{
   this._id         = ''
   this.UserID      = user_id
   this.Products    = []

   this.Set(data)
   {
      this._id       = data._id
      this.UserID    = data.UserID
      this.Products  = data.Products
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
        this._id   = new ObjectID()
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

   this.Read        = function ()
   {
        // TODO
        // Should Do Better
        // Model Product First
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

   this.Checkout    = function(data)
   {
      const cart = this.GetByIDAndUserID(ObjectId(data.CartID), ObjectId(data.UserID))
      if (!cart || !cart.Products.length)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
        let     reason_     = reason.CartNotFound
        if (cart) { reson_ = reason.NoProductsFound }
        throw new Err(code_, status_, reason_)
      }

      const   storeId = this.Products[0].StoreID
            , store_  = new Store()
            , store   = store_.GetByID(storeId)
      if (!store)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.StoreNotFound
        throw new Err(code_, status_, reason_)
      }

      const journal = new Journal()
      journal.Seller = 
      {
            ID        : store._id
          , Name      : store.Name
          , Location  : store.Location
          , Address   : store.Address
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
        journal.Products.push(node)
        journal.Bill.Total += node.Price
      })

      journal.New(data)
   }

   this.Flush       = function(Id)
   {
      const cart = this.GetByID(ObjectId(Id))
      if (!cart)
      {
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.CartNotFound
        throw new Err(code_, status_, reason_)
      }
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
          , opts  = { $set: { 'Products.$.Quantity': qnty }      }

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