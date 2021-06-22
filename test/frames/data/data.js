const { User }     = require('./user')
    , { Store }    = require('./store')
    , { Product }  = require('./product')
    , { Address }  = require('./address')
    , { Cart }     = require('./cart')

const obj =
{
      User    : 'User'
    , Product : 'Product'
    , Store   : 'Store'
    , Address : 'Address'
    , Cart    : 'Cart'
}


const Get = function(enty, id)
{
    switch(enty)
    {
    case obj.User    : return    User.Users     [id]
    case obj.Store   : return   Store.Stores    [id]
    case obj.Product : return Product.Products  [id]
    case obj.Address : return Address.Addresses [id]
    case obj.Cart    : return    Cart.Carts     [id]
    }
}

const Set = function(enty, id, data)
{
    switch(enty)
    {
    case obj.User    :    User.Users     [id] = data; break
    case obj.Store   :   Store.Stores    [id] = data; break
    case obj.Product : Product.Products  [id] = data; break
    case obj.Address : Address.Addresses [id] = data; break
    case obj.Cart    :    Cart.Carts     [id] = data; break
    }
}

module.exports =
{
      Get : Get
    , Set : Set
    , Obj : obj
}