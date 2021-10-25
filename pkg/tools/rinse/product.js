const cart            = require('../../config/cart/archive')
    , { verb, query } = require('../../system/models')

module.exports =
{
    [verb.list]: async function(entity_, data)
    {
        let cart_ = await cart.Get(entity_.User._id, query.ByUserID)
        for(let idx = 0; idx < data.length; idx++)
        {
            data[idx].CountAtCart = 0 // TODO Test it
            for(let jdx = 0; jdx < cart_.Products.length; jdx++)
            if(String(data[idx].ProductID) === String(cart_.Products[jdx].ProductID))
            data[idx].CountAtCart = cart_.Products[jdx].Quantity
        }
    }
    , [verb.view]: async function(entity_, product)
    {
        product.CountAtCart = 0
        let cart_ = await cart.Get(entity_.User._id, query.ByUserID)
        for(let jdx = 0; jdx < cart_.Products.length; jdx++)
        if(String(product.ProductID) === String(cart_.Products[jdx].ProductID))
        product.CountAtCart = cart_.Products[jdx].Quantity
    }
}