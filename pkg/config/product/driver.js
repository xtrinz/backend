const { ObjectId, ObjectID } = require('mongodb')
    , { Err_ }               = require('../../system/models')
    , Model                  = require('../../system/models')
    , db                     = require('../exports')[Model.segment.db]
    , rinse                  = require('../../tools/rinse/product')
    , Log                    = require('../../system/log')

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
        , HasCOD       : data.HasCOD
        , Variants     : 
        {
                Id    : ''
            , Type    : '' // COLOR / SIZE
        }
        , Location    : data.Store.Address.Location
    }

    this.Add      = async function ()
    {
        const key =
        { 
                StoreID : ObjectId(this.Data.StoreID)
            , Name    : this.Data.Name
        }
        , product = await db.product.Get(key, Model.query.Custom)
        if (product) Err_(Model.code.BAD_REQUEST, Model.reason.ProductExists)
         
        this.Data._id = new ObjectID()
         
        await db.product.Save(this.Data)
        Log('new-product-added', { Product: this.Data})
    }

    this.Read           = async function (product_id, entity_)
    {
        Log('read-product', { ProductID : product_id })

        const product = await db.product.Get(product_id, Model.query.ByID)
        if (!product) Err_(Model.code.BAD_REQUEST, Model.reason.ProductNotFound)

        product.IsAvailable        
        delete product.Location

        product.ProductID = product._id
        delete product._id

        // Polulate count at from cart
        if(entity_.Mode === Model.mode.User)
        await rinse[Model.verb.view](entity_, product)

        return product
    }

    this.List           = async function (in_, entity_)
    {
        Log('list-product', { Data : in_ })
        
        in_.Query = {}

        if(entity_.Mode === Model.mode.User) in_.Query.IsAvailable = true
        if(in_.Latitude  !== undefined &&
           in_.Longitude !== undefined)
        { in_.Query.Location = { $geoWithin: { $center: [ [ in_.Latitude.loc(), in_.Longitude.loc()], 2500 ] } } }

        if(in_.StoreID)  in_.Query.StoreID  = ObjectId(in_.StoreID)
        if(in_.Category) in_.Query.Category = in_.Category
        if(in_.Text)     in_.Query['$text'] = { $search: in_.Text }

        const data = await db.product.ReadAll(in_, entity_.Mode)

        // Polulate CountAtCart
        if(entity_.Mode === Model.mode.User)
        await rinse[Model.verb.list](entity_, data)

        Log('product-list', { Data : data })

        return data
    }    

    this.Modify      = async function (data)
    {
        Log('modify-product', { ProductID: data.ProductID })

        prod = await db.product.Get(data.ProductID, Model.query.ByID)
        if (!prod) Err_(Model.code.BAD_REQUEST, Model.reason.ProductNotFound)

        prod.Name          = (data.Name)?           data.Name                  : prod.Name
        prod.Image         = (data.Image)?          data.Image                 : prod.Image
        prod.Price         = (data.Price)?          data.Price                 : prod.Price
        prod.Description   = (data.Description)?    data.Description           : prod.Description
        prod.Category      = (data.Category)?       data.Category              : prod.Category
        prod.Variants.Id   = (data.VariantID)?      data.VariantID             : prod.Variants.Id
        prod.Variants.Type = (data.Type)?           data.Type                  : prod.Variants.Type
        prod.IsAvailable   = (data.IsAvailable != undefined)? data.IsAvailable : prod.IsAvailable
        prod.HasCOD        = (data.HasCOD != undefined)? data.HasCOD           : prod.HasCOD
        prod.PricePerGV    = (data.PricePerGV)?    data.PricePerGV             : prod.PricePerGV
        prod.GroundVolume  = (data.GroundVolume)?  data.GroundVolume           : prod.GroundVolume 
        prod.Unit          = (data.Unit)?          data.Unit                   : prod.Unit
        prod.Location      = data.Store.Address.Location

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

        Log('product-modified', { Product: this.Data })
    }

}

module.exports = 
{
    Product : Product
}