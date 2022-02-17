const { Client }   = require('./role/client/data')
    , { Agent }    = require('./role/agent/data')
    , { Arbiter }  = require('./role/arbiter/data')    
    , { Seller }   = require('./role/seller/data')
    , { Product }  = require('./fin/product/data')
    , { Address }  = require('./fin/address/data')
    , { Cart }     = require('./fin/cart/data')
    , { Note }     = require('./fin/note/data')    
    , { Journal }  = require('./run/journal/data')

const obj =
{
      Client    : 'Client'
    , Agent   : 'Agent'
    , Arbiter : 'Arbiter'    
    , Product : 'Product'
    , Seller  : 'Seller'
    , Address : 'Address'
    , Cart    : 'Cart'
    , Journal : 'Journal'
    , Note    : 'Note'
}


const Get = function(enty, id)
{
    switch(enty)
    {
    case obj.Client    : return    Client.Clients     [id]
    case obj.Agent   : return   Agent.Agents    [id]    
    case obj.Arbiter : return Arbiter.Arbiters  [id]        
    case obj.Seller  : return  Seller.Sellers   [id]
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
    case obj.Client    :    Client.Clients     [id] = data; break
    case obj.Agent   :   Agent.Agents    [id] = data; break
    case obj.Arbiter : Arbiter.Arbiters  [id] = data; break    
    case obj.Seller  :  Seller.Sellers   [id] = data; break
    case obj.Product : Product.Products  [id] = data; break
    case obj.Address : Address.Addresses [id] = data; break
    case obj.Cart    :    Cart.Carts     [id] = data; break
    case obj.Journal : Journal.Journals  [id] = data; break
    case obj.Note    :    Note.Notes     [id] = data; break
    }
}

const Reset = function()
{
      Client.Clients   = {}
       Agent.Agents    = {}
     Arbiter.Arbiters  = {}    
      Seller.Sellers   = {}
     Product.Products  = {}
     Address.Addresses = {}
        Cart.Carts     = {}
     Journal.Journals  = {}
        Note.Notes     = {}
}

module.exports =
{
      Get   : Get
    , Set   : Set
    , Obj   : obj
    , Reset : Reset
}