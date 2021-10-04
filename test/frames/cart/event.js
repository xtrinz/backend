const data                   = require('../data')
    , { Method, Type }       = require('../../lib/medium')
    , { code, status, text } = require('../../../pkg/system/models')

let Insert = function(user_, cart_, product_) 
{
  this.UserID  	 = user_
  this.CartID  	 = cart_
  this.ProductID = product_
  this.Data     = function()
  {
    let user    = data.Get(data.Obj.User,    this.UserID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let cart    = data.Get(data.Obj.Cart,    this.CartID)
    cart.AddProduct(this.ProductID)
    // TODO set custom product qnty
    let templ   =
    {
        Type          : Type.Rest
      , Describe      : 'Cart Insert'
      , Request       :
      {                 
          Method      : Method.POST
        , Path        : '/v1/cart/insert'
        , Body        : 
        {             
            ProductID : product.ID
          , StoreID   : product.StoreID
          , Quantity  : product.Quantity
        }             
        , Header      : { Authorization: user.Token }
      }                 
      , Skip          : [ 'EntryID' ]
      , Response      :
      {                 
          Code        : code.OK
        , Status      : status.Success
        , Text        : text.ProductAdded
        , Data        : {}
      }
    }
    return templ
  }
}

let List = function(user_, cart_, addr_, store_) 
{
  this.UserID  	 = user_
  this.CartID  	 = cart_
  this.AddressID = addr_
  this.StoreID   = store_
  this.Data      = function()
  {
    let user    = data.Get(data.Obj.User,    this.UserID)
    let cart    = data.Get(data.Obj.Cart,    this.CartID)
    let addr    = data.Get(data.Obj.Address, this.AddressID)
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    // TODO set custom product qnty
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Cart List'
      , Request               :
      {
            Method            : Method.GET
          , Path              : '/v1/cart/list'
          , Body              : {}
          , Query             : { AddressID : addr.ID }
          , Header            : { Authorization: user.Token }
      }
      , Response              :
      {
            Code              : code.OK
          , Status            : status.Success
          , Text              : ''
          , Data              : 
          {
                Products      : cart.Products
              , Flagged       : false
              , JournalID     : ''
              , StoreID       : store.ID
              , Address       :
              {                  
                  AddressID    : addr.ID 
                , Longitude    : addr.Longitude
                , Latitude     : addr.Latitude
                , Tag          : addr.Tag
                , IsDefault    : addr.IsDefault
                , Address      :
                  {                  
                      Name       : addr.Address.Name
                    , Line1      : addr.Address.Line1
                    , Line2      : addr.Address.Line2
                    , City       : addr.Address.City
                    , PostalCode : addr.Address.PostalCode
                    , State      : addr.Address.State
                    , Country    : addr.Address.Country
                  } 
              }
              , Bill          : 
              {
                  Total       : cart.Bill.Total
                , TransitCost : cart.Bill.TransitCost
                , Tax         : cart.Bill.Tax
                , NetPrice    : cart.Bill.NetPrice
              }
          }
      }
    }
    return templ
  }

}

let Update = function(user_, product_) 
{
  this.UserID  	 = user_
  this.ProductID = product_
  this.Data     = function()
  {
    let user    = data.Get(data.Obj.User,    this.UserID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    // TODO set custom product qnty
    let templ   =
    {
        Type            : Type.Rest
      , Describe        : 'Cart Update'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/v1/cart/modify'
        , Body          : 
        {
            ProductID   : product.ID
          , Quantity    : 5
        }
        , Header        : { Authorization: user.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.ProductUpdated
        , Data          : {}
      }
    }
    return templ
  }
}

let Remove = function(user_, product_) 
{
  this.UserID  	 = user_
  this.ProductID = product_
  this.Data     = function()
  {
    let user    = data.Get(data.Obj.User,    this.UserID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let cart_id = this.UserID
    let cart    = data.Get(data.Obj.Cart,    cart_id)
    cart.RemoveProduct(this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Cart Remove'
      , Request               :
      {
            Method            : Method.DELETE
          , Path              : '/v1/cart/remove'
          , Body              : 
          {
            ProductID         : product.ID
          }
          , Header            : { Authorization: user.Token }
      }
      , Response              :
      {
            Code              : code.OK
          , Status            : status.Success
          , Text              : text.ProductRemoved
          , Data              : {}
      }
    }
    return templ
  }
}

module.exports =
{
    Insert, List, Update, Remove
}