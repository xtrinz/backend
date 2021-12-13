const { Method, Type }       = require('../../lib/medium')
    , { code, status, text } = require('../../../pkg/system/models')
    , data                   = require('../data')

let Add = function(store_, product_) 
{
    this.StoreID  	= store_
    this.ProductID  = product_
    this.Data     = function()
    {
      let store       = data.Get(data.Obj.Store, this.StoreID)
      let product     = data.Get(data.Obj.Product, this.ProductID)
      product.StoreID = store.ID
      data.Set(data.Obj.Product, this.ProductID, product)
      let templ =
      {
          Type                  : Type.Rest
        , Describe              : 'Product Add'
        , Request               :
        {
              Method            : Method.POST
            , Path              : '/v1/product/add'
            , Body              : 
            {
                  StoreID       : store.ID
                , Name          : product.Name
                , Image         : product.Image
                , Price         : product.Price
                , Quantity      : product.Quantity
                , Description   : product.Description
                , Category      : product.Category
                , VolumeBase    : product.VolumeBase
                , Unit          : product.Unit
                , HasCOD        : product.HasCOD
            }
            , Header            : { Authorization: store.Token }
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
      product.ID       = res_.Data.ProductID
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
            , Path              : '/v1/product/view'
            , Body              : {}
            , Query             : 
            {
                  ProductID     : product.ID
            }
            , Header            : { Authorization: user.Token }
        }
        , Response              :
        {
            Code              : code.OK
          , Status            : status.Success
          , Text              : ''
          , Data              :
          {
              ProductID     : product.ID
            , StoreID       : store.ID
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , CountAtCart   : 0
            , Description   : product.Description
            , Category      : product.Category          
            , IsAvailable   : true 
            , VolumeBase    : product.VolumeBase
            , Unit          : product.Unit            
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
        , Path              : '/v1/product/list'
        , Body              : {}
        , Query             : 
        {
              StoreID       : store.ID
            , Page          : 1
            , Limit         : 8
            , Longitude     : store.Address.Longitude
            , Latitude      : store.Address.Latitude 
            , Category      : product.Category 
            , Text          : product.Category                      
        }
        , Header            : { Authorization: user.Token }
      }
      , Response              :
      {
          Code              : code.OK
        , Status            : status.Success
        , Text              : ''
        , Data              :
        [{
              ProductID     : product.ID
            , StoreID       : store.ID
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , CountAtCart   : 0            
            , Description   : product.Description
            , Category      : product.Category
            , IsAvailable   : true
            , VolumeBase    : product.VolumeBase
            , Unit          : product.Unit            
        }]
      }
    }
    return templ
  }
}

let Modify = function(store_, product_) 
{
  this.StoreID   = store_
  this.ProductID = product_
  this.Data      = function()
  {
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Product Modify'
      , Request               :
      {
            Method            : Method.PUT
          , Path              : '/v1/product/modify'
          , Body              : 
          {
                ProductID     : product.ID
              , Name          : product.Name
              , Image         : product.Image
              , Price         : 200
              , Quantity      : product.Quantity
              , Description   : product.Description
              , Category      : product.Category
              , VolumeBase    : product.VolumeBase
              , Unit          : product.Unit
              , HasCOD        : product.HasCOD              
          }
          , Header            : { Authorization: store.Token }
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

let Remove = function(store_, product_) 
{
  this.StoreID   = store_
  this.ProductID = product_
  this.Data      = function()
  {
    let store   = data.Get(data.Obj.Store,   this.StoreID)
    let product = data.Get(data.Obj.Product, this.ProductID)
    let templ   =
    {
        Type                  : Type.Rest
      , Describe              : 'Product Remove'
      , Request               :
      {
            Method            : Method.DELETE
          , Path              : '/v1/product/remove'
          , Body              : 
          {
                ProductID     : product.ID
          }
          , Header            : { Authorization: store.Token }
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