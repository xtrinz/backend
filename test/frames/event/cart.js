const data                   = require('../data/data')
    , { Method, Type }       = require('../../lib/medium')
    , { code, status, text } = require('../../../pkg/common/error')

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
        , Path        : '/cart/insert'
        , Body        : 
        {             
            ProductID : product.ID
          , StoreID   : product.StoreID
          , Quantity  : product.Quantity
        }             
        , Header      : { Authorization: 'Bearer ' + user.Token }
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

let List = function(user_, cart_) 
{
  this.UserID  	 = user_
  this.CartID  	 = cart_
  this.Data     = function()
  {
    let user    = data.Get(data.Obj.User,    this.UserID)
    let cart    = data.Get(data.Obj.Cart,    this.CartID)
    // TODO set custom product qnty
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Cart List'
      , Request               :
      {
            Method            : Method.GET
          , Path              : '/cart/list'
          , Body              : {}
          , Header            : { Authorization: 'Bearer ' + user.Token }
      }
      , Response              :
      {
            Code              : code.OK
          , Status            : status.Success
          , Text              : ''
          , Data              : 
          {
                Products      : cart.Products
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
        , Path          : '/cart/modify'
        , Body          : 
        {
            ProductID   : product.ID
          , Quantity    : 5
        }
        , Header        : { Authorization: 'Bearer ' + user.Token }
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
          , Path              : '/cart/remove'
          , Body              : 
          {
            ProductID         : product.ID
          }
          , Header            : { Authorization: 'Bearer ' + user.Token }
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