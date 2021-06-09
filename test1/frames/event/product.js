const { Method, Type, Rest }  = require("../../lib/medium")
    , { code, status, text }  = require("../../../pkg/common/error")
    , data                    = require("../data/data")

let Add = function(staff_, store_, product_) 
{
    this.StaffID  	= staff_
    this.StoreID  	= store_
    this.ProductID  = product_
    this.Data     = function()
    {
      let store  = data.Get(data.Obj.Store, this.StoreID)
      let staff  = data.Get(data.Obj.User, this.StaffID)
      let product= data.Get(data.Obj.Product, this.ProductID)
      let templ =
      {
          Type                  : Type.Rest
        , Describe              : 'Product Add'
        , Request               :
        {
              Method            : Method.POST
            , Path              : '/product/add'
            , Body              : 
            {
                  StoreID       : store.ID
                , Name          : product.Name
                , Image         : product.Image
                , Price         : product.Price
                , Quantity      : product.Quantity
                , Description   : product.Description
                , CategoryID    : product.CategoryID
            }
            , Header            : { Authorization: 'Bearer ' + staff.Token }
        }
        , Skip                  : [ 'ProductID' ]
        , Response              :
        {
              Code              : code.OK
            , Status            : status.Success
            , Text              : text.ProductAdded
            , Data              : { ProductID : '' }
        }
      }
      return templ
    }

    this.PostSet = async function(res_)
    {
      let product = data.Get(data.Obj.Product, this.ProductID)
      product.ID  = res_.Data.ProductID
      data.Set(data.Obj.Product, this.ProductID, product)
    }
}

let View = function(user_, store_, product_) 
{
    this.UserID  	 = user_
    this.StoreID   = store_
    this.ProductID = product_
    this.Data      = function()
    {
      let store   = data.Get(data.Obj.Store,   this.StoreID)
      let user    = data.Get(data.Obj.User,    this.UserID)
      let product = data.Get(data.Obj.Product, this.ProductID)
      let templ   =
      {
          Type                  : Type.Rest
        , Describe              : 'Product View'
        , Request               :
        {
              Method            : Method.GET
            , Path              : '/product/view'
            , Body              : {}
            , Query             : 
            {
                  ProductID     : product.ID
            }
            , Header            : { Authorization: 'Bearer ' + user.Token }
        }
        , Response              :
        {
            Code              : code.OK
          , Status            : status.Success
          , Text              : ''
          , Data              :
          {
              _id           : product.ID
            , StoreID       : store.ID
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , Description   : product.Description
            , CategoryID    : product.CategoryID
            , Variants      : 
            {
                    Id      : ''
                , Type      : '' // COLOR / SIZE
            }            
          }
        }
      }
    return templ
  }

}

let List = function(user_, store_, product_) 
{
  this.UserID  	 = user_
  this.StoreID   = store_
  this.ProductID = product_
  this.Data      = function()
  {
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    let user    = data.Get(data.Obj.User,    this.UserID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Product List'
      , Request               :
      {
          Method            : Method.GET
        , Path              : '/product/list'
        , Body              : {}
        , Query             : 
        {
            StoreID         : store.ID
        }
        , Header            : { Authorization: 'Bearer ' + user.Token }
      }
      , Response              :
      {
          Code              : code.OK
        , Status            : status.Success
        , Text              : ''
        , Data              :
        [{
              _id           : product.ID
            , StoreID       : store.ID
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , Description   : product.Description
            , CategoryID    : product.CategoryID
        }]
      }
    }
    return templ
  }
}

let Modify = function(staff_, store_, product_) 
{
  this.StaffID   = staff_
  this.StoreID   = store_
  this.ProductID = product_
  this.Data      = function()
  {
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    let staff   = data.Get(data.Obj.User,    this.StaffID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Product Modify'
      , Request               :
      {
            Method            : Method.POST
          , Path              : '/product/modify'
          , Body              : 
          {
                ProductID     : product.ID
              , StoreID       : store.ID
              , Name          : product.Name
              , Image         : product.Image
              , Price         : 200
              , Quantity      : product.Quantity
              , Description   : product.Description
              , CategoryID    : product.CategoryID
          }
          , Header            : { Authorization: 'Bearer ' + staff.Token }
      }
      , Response              :
      {
            Code              : code.OK
          , Status            : status.Success
          , Text              : text.ProductUpdated
          , Data              : {}
      }
    }
    return templ
  }
}

let Remove = function(staff_, store_, product_) 
{
  this.StaffID   = staff_
  this.StoreID   = store_
  this.ProductID = product_
  this.Data      = function()
  {
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    let staff   = data.Get(data.Obj.User,    this.StaffID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Product Remove'
      , Request               :
      {
            Method            : Method.DELETE
          , Path              : '/product/remove'
          , Body              : 
          {
                ProductID     : product.ID
              , StoreID       : store.ID
          }
          , Header            : { Authorization: 'Bearer ' + staff.Token }
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
    Add
  , View
  , List
  , Modify
  , Remove
}