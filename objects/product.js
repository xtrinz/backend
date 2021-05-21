const { ObjectId, ObjectID }        = require('mongodb')
    , { products, users }           = require("../common/database")
    , { Err, code, status, reason } = require("../common/error")

function Product(data)
{
   this._id         = ''
   this.StoreID     = ObjectId(data.StoreID)
   this.CreatedBy   = ObjectId(data.user._id)

   this.Name        = data.Name
   this.Image       = data.Image
   this.Price       = data.Price
   this.Quantity    = data.Quantity
   this.Description = data.Description

   this.Set        = function()
   {
        this._id         = data._id
        this.StoreID     = data.StoreID
        this.CreatedBy   = data.CreatedBy
        this.Name        = data.Name
        this.Image       = data.Image
        this.Price       = data.Price
        this.Quantity    = data.Quantity
        this.Description = data.Description
   }

   this.Save       = async function()
   {
        console.log('save-product', this)
        const resp  = await users.updateOne({ _id 	 : this._id },
                                            { $set   : this	    },
                                            { upsert : true     })
        if (resp.modifiedCount !== 1) 
        {
            console.log('save-product-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                            status.Failed,
                            reason.DBAdditionFailed)
        }
   }
   
   this.GetByID = async function(_id)
   {
       console.log(`find-product-by-id. ID: ${_id}`)
       const query = { _id: _id }
       let product = await products.findOne(query)
       if (!product)
       {
         console.log(`product-not-found. ID: ${_id}`)
         return
       }
       this.Set(product)
       console.log(`product-found. product: ${product}`)
       return product
   }

   this.DelByID = async function(Id)
   {
        const query = {_id : ObjectId(Id)}
        const resp  = await products.deleteOne(query);
        if (resp.deletedCount !== 1)
        {
            console.log('product-deletion-failed', query)
            return false
        }
        console.log('product-deleted', query)
        return true
   }
   
   this.GetByStoreID = async function(_id)
   {
       console.log(`find-product-by-store-id. StoreID: ${_id}`)
       const project = 
       {
         _id  : 1,  StoreID : 1,
         Name : 1,  Image   : 1,
         Price: 1,  Quantity: 1 
       }
       const query = { StoreID: ObjectId(_id) }
       let products_ = await products.find(query, project)
                                          .toArray()
       if (!products_.length)
       {
         console.log(`no-product-found. StoreID: ${_id}`)
         return
       }
       console.log(`products-found. product_len: ${products_.length}`)
       return products_
   }

   this.FindByStoreIDAndName = async function(store_id, name)
   {
       console.log(`find-product-by-store-id-and-name. ID: ${store_id, name}`)
       const query = { StoreID: store_id, Name: name }
       let product = await products.findOne(query)
       if (!product)
       {
         console.log(`product-not-found. ID: ${store_id, name}`)
         return
       }
       this.Set(product)
       console.log(`product-found. product: ${product}`)
       return product
   }

   this.Add      = async function ()
   {
        // Permission Check
        const product = await this.FindByStoreIDAndName(this.StoreID, this.Name)
        if (product)
        {
            throw new Err(code.BAD_REQUEST,
                          status.Failed,
                          reason.ProductExists)
        }
        this._id = new ObjectID()
        this.Save()
        console.log(`new-product-added. product: ${this}`)
   }

   this.ReadAll        = function (store_id)
   {
        console.log('read-all-product-by-store-id', store_id)
        return this.GetByStoreID(ObjectId(store_id))
   }

   this.Read           = function (product_id)
   {
       console.log('read-product', product_id)
       const product = this.GetByID(ObjectId(product_id))
       if (!product)
       {
           const   code_   = code.BAD_REQUEST
                 , status_ = status.Failed
                 , reason_ = reason.ProductNotFound
           throw new Err(code_, status_, reason_)
       }
       return product
   }

   this.Modify      = async function (Id)
   {
        // Permission Check
        console.log('modify-product', this, Id)
        const product = await this.GetByID(ObjectId(Id))
        if (!product)
        {
            throw new Err(code.BAD_REQUEST,
                            status.Failed,
                            reason.ProductNotFound)
        }
        this._id = product._id
        this.Save()
        console.log(`product-modified. product: ${this}`)
   }

   this.Remove      = function (Id)
   {
        // Permission Check
        if (!this.DelByID(ObjectId(Id)))
        {
            console.log('product-removal-failed', query)
            const   code_  = code.INTERNAL_SERVER
                , status_= status.Failed
                , reason_= reason.DBDeletionFailed
            throw new Err(code_, status_, reason_)
        }
   }
}

module.exports = 
{
    Product : Product
}