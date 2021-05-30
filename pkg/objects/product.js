const { ObjectId, ObjectID } = require('mongodb')
    , { Err_, code, reason } = require("../common/error")
    , test                    = require('../common/test')
    , { query }              = require("../common/models")
    , { products }           = require("../common/database")

function Product(data)
{
   if(data)
   this.Data =
   {
            _id       : ''
        , StoreID     : ObjectId(data.StoreID)
        , CreatedBy   : ObjectId(data.User._id)
        , Name        : data.Name
        , Image       : data.Image
        , Price       : data.Price
        , Quantity    : data.Quantity
        , Description : data.Description
        , CategoryID  : data.CategoryID
        , Variants    : 
        {
                Id    : ''
            , Type    : '' // COLOR / SIZE
        }
    }

   this.Save       = async function()
   {
       console.log('save-product', this.Data)
       const key   = { _id    : this.Data._id }
           , act   = { $set   : this.Data }
           , opt   = { upsert : true }
       const resp  = await products.updateOne(key, act, opt)
       if (!resp.result.ok)
       {
           console.log('product-save-failed',
           { Data: this.Data, Result: resp.result })
           Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
       }
       console.log('product-saved', this.Data)
   }

   this.Get = async function(param, qType)
   {
       console.log('find-product', { Param: param, QType: qType})
       let query_
       switch (qType)
       {
           case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
           case query.Custom : query_ = param                    ; break;
       }
       let product = await products.findOne(query_)
       if (!product)
       {
         console.log('product-not-found', query_)
         return
       }
       this.Data = product
       console.log('product-found', { Product: product })
       return product
   }

   this.Add      = async function ()
   {
        const key   = 
        { 
            StoreID : ObjectId(this.Data.StoreID),
            Name    : this.Data.Name
        }
        const product = await this.Get(key, query.Custom)
        if (product) Err_(code.BAD_REQUEST, reason.ProductExists)
        this.Data._id = new ObjectID()
        test.Set('ProductID', this.Data._id) // #101
        await this.Save()
        console.log('new-product-added', { Product: this.Data})
   }

   this.ReadAll         = async function (store_id)
   {
        console.log('find-all-product-by-store-id', { StoreID: store_id})
        const project   =
        {
          _id         : 1, StoreID    : 1,
          Name        : 1, Image      : 1,
          Price       : 1, Quantity   : 1,
          Description : 1, CategoryID : 1 
        }
        const query     = { StoreID: ObjectId(store_id) }
            , products_ = await products.find(query).project(project).toArray()
        if (!products_.length)
        {
          console.log('no-product-found', { StoreID: store_id})
          return
        }
        console.log('products-found', {ProductLen: products_.length}, products_)
        return products_
   }

   this.Read           = async function (product_id)
   {
       console.log('read-product', product_id)
       const product = await this.Get(product_id, query.ByID)
       if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)
       delete product.CreatedBy
       return product
   }

   this.Modify      = async function (data)
   {
        console.log('modify-product', { ProductID: data.ProductID })
        const product = await this.Get(data.ProductID, query.ByID)
        if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)
        this.Data.Name          = (data.Name)?        data.Name        : this.Data.Name
        this.Data.Image         = (data.Image)?       data.Image       : this.Data.Image
        this.Data.Price         = (data.Price)?       data.Price       : this.Data.Price
        this.Data.Quantity      = (data.Quantity)?    data.Quantity    : this.Data.Quantity
        this.Data.Description   = (data.Description)? data.Description : this.Data.Description
        this.Data.CategoryID    = (data.CategoryID)?  data.CategoryID  : this.Data.CategoryID
        this.Data.Variants.Id   = (data.VariantID)?   data.VariantID   : this.Data.Variants.Id
        this.Data.Variants.Type = (data.Type)?        data.Type        : this.Data.Variants.Type
        await this.Save()
        console.log('product-modified', { Product: this.Data })
   }

   this.Remove      = async function (data)
   {
        const query = 
        {
            StoreID : ObjectId(data.StoreID), 
            _id     : ObjectId(data.ProductID)
        }
        const resp  = await products.deleteOne(query);
        if (resp.deletedCount !== 1)
        {
            console.log('product-deletion-failed', query)
            Err_(code.INTERNAL_SERVER, reason.DBDeletionFailed)
        }
        console.log('product-deleted', query)
   }
}

module.exports = 
{
    Product : Product
}