const cart            = require('../../pipe/fin/cart/archive')
    , { verb, query,
        Err_, code,
        reason }      = require('../../sys/models')
        , Log         = require('../../sys/log')

module.exports =
{
    [verb.list]: async function(entity_, data)
    {
        let cart_ = await cart.Get(entity_.Client._id, query.ByClientID)
        if(!cart_)
        {
            Log('No cart found for client', { ClientID: entity_.Client._id})
            Err_(code.NOT_FOUND, reason.CartNotFound)
        }
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
        delete product.HasCOD // Only for Client
        product.CountAtCart = 0
        let cart_ = await cart.Get(entity_.Client._id, query.ByClientID)
        if(!cart_)
        {
            Log('No cart found for client', { ClientID: entity_.Client._id})
            Err_(code.NOT_FOUND, reason.CartNotFound)
        }
        for(let jdx = 0; jdx < cart_.Products.length; jdx++)
        if(String(product.ProductID) === String(cart_.Products[jdx].ProductID))
        product.CountAtCart = cart_.Products[jdx].Quantity
    }
}