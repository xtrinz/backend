const { ObjectId, ObjectID } = require('mongodb')
    , { Err_, code, reason } = require('../../system/models')
    , { query }              = require('../../system/models')
    , db                     = require('../product/archive')

function Product(data)
{
   if(data)
   this.Data =
   {
            _id       : ''
        , StoreID     : ObjectId(data.Store._id)
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

    this.Add      = async function ()
    {
        const key =
        { 
                StoreID : ObjectId(this.Data.StoreID)
            , Name    : this.Data.Name
        }
        , product = await db.Get(key, query.Custom)
        if (product) Err_(code.BAD_REQUEST, reason.ProductExists)
         
        this.Data._id = new ObjectID()
         
        await db.Save(this.Data)
        console.log('new-product-added', { Product: this.Data})
    }

    this.Read           = async function (product_id)
    {
        console.log('read-product', { ProductID : product_id })

        const product = await db.Get(product_id, query.ByID)
        if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)

        return product
    }

    this.Modify      = async function (data)
    {
        console.log('modify-product', { ProductID: data.ProductID })

        this.Data = await db.Get(data.ProductID, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.ProductNotFound)

        this.Data.Name          = (data.Name)?        data.Name        : this.Data.Name
        this.Data.Image         = (data.Image)?       data.Image       : this.Data.Image
        this.Data.Price         = (data.Price)?       data.Price       : this.Data.Price
        this.Data.Quantity      = (data.Quantity)?    data.Quantity    : this.Data.Quantity
        this.Data.Description   = (data.Description)? data.Description : this.Data.Description
        this.Data.CategoryID    = (data.CategoryID)?  data.CategoryID  : this.Data.CategoryID
        this.Data.Variants.Id   = (data.VariantID)?   data.VariantID   : this.Data.Variants.Id
        this.Data.Variants.Type = (data.Type)?        data.Type        : this.Data.Variants.Type

        await db.Save(this.Data)

        console.log('product-modified', { Product: this.Data })
    }

}

module.exports = 
{
    Product : Product
}