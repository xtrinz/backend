const { ObjectId, ObjectID }        = require('mongodb')
    , { Err_, code, reason, query, mode } = require('../../system/models')
    , db                            =
    {
        product : require('../product/archive')
        , cart  : require('../cart/archive')
    }

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
        , Category    : data.Category
        , IsAvailable : true
        , Variants    : 
        {
                Id    : ''
            , Type    : '' // COLOR / SIZE
        }
        , Location    : data.Store.Location
    }

    this.Add      = async function ()
    {
        const key =
        { 
                StoreID : ObjectId(this.Data.StoreID)
            , Name    : this.Data.Name
        }
        , product = await db.product.Get(key, query.Custom)
        if (product) Err_(code.BAD_REQUEST, reason.ProductExists)
         
        this.Data._id = new ObjectID()
         
        await db.product.Save(this.Data)
        console.log('new-product-added', { Product: this.Data})
    }

    this.Read           = async function (product_id, entity_)
    {
        console.log('read-product', { ProductID : product_id })

        const product = await db.product.Get(product_id, query.ByID)
        if (!product) Err_(code.BAD_REQUEST, reason.ProductNotFound)

        product.IsAvailable        
        delete product.Location

        product.ProductID = product._id
        delete product._id

        // Polulate count at from cart
        if(entity_.Mode === mode.User)
        {
            product.CountAtCart = 0
            let cart = await db.cart.Get(entity_.User._id, query.ByUserID)
            for(let jdx = 0; jdx < cart.Products.length; jdx++)
            if(String(product.ProductID) === String(cart.Products[jdx].ProductID))
            product.CountAtCart = cart.Products[jdx].Quantity
        }        

        return product
    }

    this.List           = async function (in_, entity_)
    {
        console.log('list-product', { Data : in_ })
        
        in_.Query = {}

        if(entity_.Mode === mode.User) in_.Query.IsAvailable = true
        if(in_.Latitude  !== undefined &&
           in_.Longitude !== undefined)
        { in_.Query.Location = { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } }

        if(in_.StoreID)  in_.Query.StoreID  = ObjectId(in_.StoreID)
        if(in_.Category) in_.Query.Category = in_.Category
        if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

        const data = await db.product.ReadAll(in_, entity_.Mode)

        // Polulate count at from cart
        if(entity_.Mode === mode.User)
        {
            let cart = await db.cart.Get(entity_.User._id, query.ByUserID)
            for(let idx = 0; idx < data.length; idx++)
            {
                data[idx].CountAtCart = 0 // TODO Test it
                for(let jdx = 0; jdx < cart.Products.length; jdx++)
                if(String(data[idx].ProductID) === String(cart.Products[jdx].ProductID))
                data[idx].CountAtCart = cart.Products[jdx].Quantity
            }
        }

        console.log('product-list', { Data : data })

        return data
    }    

    this.Modify      = async function (data)
    {
        console.log('modify-product', { ProductID: data.ProductID })

        this.Data = await db.product.Get(data.ProductID, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.ProductNotFound)

        this.Data.Name          = (data.Name)?        data.Name                      : this.Data.Name
        this.Data.Image         = (data.Image)?       data.Image                     : this.Data.Image
        this.Data.Price         = (data.Price)?       data.Price                     : this.Data.Price
        this.Data.Quantity      = (data.Quantity)?    data.Quantity                  : this.Data.Quantity
        this.Data.Description   = (data.Description)? data.Description               : this.Data.Description
        this.Data.Category      = (data.Category)?    data.Category                  : this.Data.Category
        this.Data.Variants.Id   = (data.VariantID)?   data.VariantID                 : this.Data.Variants.Id
        this.Data.Variants.Type = (data.Type)?        data.Type                      : this.Data.Variants.Type
        this.Data.IsAvailable   = (data.IsAvailable !== undefined)? data.IsAvailable : this.Data.IsAvailable
        this.Data.Location      = data.Store.Location
        await db.product.Save(this.Data)

        console.log('product-modified', { Product: this.Data })
    }

}

module.exports = 
{
    Product : Product
}