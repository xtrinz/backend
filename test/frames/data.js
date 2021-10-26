    const { User }     = require('./user/data')
    , { Agent }    = require('./agent/data')
    , { Store }    = require('./store/data')
    , { Product }  = require('./product/data')
    , { Address }  = require('./address/data')
    , { Cart }     = require('./cart/data')
    , { Journal }  = require('./journal/data')
    , { Note }     = require('./note/data')    

const obj =
{
      User    : 'User'
    , Agent   : 'Agent'
    , Product : 'Product'
    , Store   : 'Store'
    , Address : 'Address'
    , Cart    : 'Cart'
    , Journal : 'Journal'
    , Note    : 'Note'
}


const Get = function(enty, id)
{
    switch(enty)
    {
    case obj.User    : return    User.Users     [id]
    case obj.Agent   : return   Agent.Agents    [id]    
    case obj.Store   : return   Store.Stores    [id]
    case obj.Product : return Product.Products  [id]
    case obj.Address : return Address.Addresses [id]
    case obj.Cart    : return    Cart.Carts     [id]
    case obj.Journal : return Journal.Journals  [id]
    case obj.Note    : return    Note.Notes     [id]
    }
}

const Set = function(enty, id, data)
{
    switch(enty)
    {
    case obj.User    :    User.Users     [id] = data; break
    case obj.Agent   :   Agent.Agents    [id] = data; break
    case obj.Store   :   Store.Stores    [id] = data; break
    case obj.Product : Product.Products  [id] = data; break
    case obj.Address : Address.Addresses [id] = data; break
    case obj.Cart    :    Cart.Carts     [id] = data; break
    case obj.Journal : Journal.Journals  [id] = data; break
    case obj.Note    :    Note.Notes     [id] = data; break
    }
}

module.exports =
{
      Get : Get
    , Set : Set
    , Obj : obj
}