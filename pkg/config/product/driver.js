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
            _id        : ''
        , StoreID      : ObjectId(data.Store._id)
        , Name         : data.Name
        , Image        : data.Image
        , Price        : data.Price
        , Quantity     : data.Quantity
        , Description  : data.Description
        , Category     : data.Category
        , PricePerGV   : data.PricePerGV
        , GroundVolume : data.GroundVolume
        , Unit         : data.Unit
        , IsAvailable  : true
        , Variants     : 
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

        prod = await db.product.Get(data.ProductID, query.ByID)
        if (!prod) Err_(code.BAD_REQUEST, reason.ProductNotFound)

        prod.Name          = (data.Name)?           data.Name                  : prod.Name
        prod.Image         = (data.Image)?          data.Image                 : prod.Image
        prod.Price         = (data.Price)?          data.Price                 : prod.Price
        prod.Description   = (data.Description)?    data.Description           : prod.Description
        prod.Category      = (data.Category)?       data.Category              : prod.Category
        prod.Variants.Id   = (data.VariantID)?      data.VariantID             : prod.Variants.Id
        prod.Variants.Type = (data.Type)?           data.Type                  : prod.Variants.Type
        prod.IsAvailable   = (data.IsAvailable != undefined)? data.IsAvailable : prod.IsAvailable
        prod.PricePerGV    = (data.PricePerGV)?    data.PricePerGV             : prod.PricePerGV
        prod.GroundVolume  = (data.GroundVolume)?  data.GroundVolume           : prod.GroundVolume 
        prod.Unit          = (data.Unit)?          data.Unit                   : prod.Unit
        prod.Location      = data.Store.Location

        let act = {}
        if(data.IsAvailable != undefined &&
            !data.IsAvailable) 
        { prod.Quantity = 0 }
        else if(data.Quantity != undefined)
        {
            if(prod.Quantity + data.Quantity > 0)
            {
                delete prod.Quantity
                act[ '$inc' ] = { Quantity: data.Quantity }
            }
            else { prod.Quantity = 0 }
        }

        act[ '$set' ] = prod
        await db.product.Update(prod._id, act)

        console.log('product-modified', { Product: this.Data })
    }

}

module.exports = 
{
    Product : Product
}