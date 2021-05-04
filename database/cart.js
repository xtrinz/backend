const { carts }                     = require("../connect")
const { Err, code, status, reason } = require("../../common/error")

function Cart(user_id)
{
   this._id         = ''
   this.UserID      = user_id
   this.Products    = []

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

   this.Delete      = function (Id)
   {
        const query = {_id : Id}
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
}

function CartEntry(data)
{
   this._id         = ''
   this.ProductsID  = data.ProductsID
   //this.UniqueID  = data.UniqueID // TODO uncomment when it seems meaningful
   this.ShopID      = data.ShopID
   this.Qnty        = data.Quantity

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
          , opts  = { $set: { 'Products.$.Qnty': qnty }      }

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