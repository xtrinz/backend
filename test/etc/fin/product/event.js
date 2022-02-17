const { Method, Type } = require('../../../lib/medium')
    , Model            = require('../../../../pkg/sys/models')
    , data             = require('../../data')

let Add = function(seller_, product_) 
{
    this.SellerID  	= seller_
    this.ProductID  = product_
    this.Data     = function()
    {
      let seller       = data.Get(data.Obj.Seller, this.SellerID)
      let product     = data.Get(data.Obj.Product, this.ProductID)
      product.SellerID = seller.ID
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
                  SellerID       : seller.ID
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
            , Header            : { Authorization: seller.Token }
        }
        , Skip                  : [ 'ProductID' ]
        , Response              :
        {
              Code              : Model.code.OK
            , Status            : Model.status.Success
            , Text              : Model.text.ProductAdded
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

let View = function(client_, seller_, product_) 
{
    this.ClientID  	 = client_
    this.SellerID   = seller_
    this.ProductID = product_
    this.Data      = function()
    {
      let seller   = data.Get(data.Obj.Seller,   this.SellerID)
      let client    = data.Get(data.Obj.Client,    this.ClientID)
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
            , Header            : { Authorization: client.Token }
        }
        , Response              :
        {
            Code              : Model.code.OK
          , Status            : Model.status.Success
          , Text              : ''
          , Data              :
          {
              ProductID     : product.ID
            , SellerID       : seller.ID
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

let List = function(client_, seller_, product_) 
{
  this.ClientID  	 = client_
  this.SellerID   = seller_
  this.ProductID = product_
  this.Data      = function()
  {
    let seller   = data.Get(data.Obj.Seller,   this.SellerID)
    let client    = data.Get(data.Obj.Client,    this.ClientID)
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
              SellerID       : seller.ID
            , Page          : 1
            , Limit         : 8
            , Longitude     : seller.Address.Longitude
            , Latitude      : seller.Address.Latitude 
            , Category      : product.Category 
            , Text          : product.Category                      
        }
        , Header            : { Authorization: client.Token }
      }
      , Response              :
      {
          Code              : Model.code.OK
        , Status            : Model.status.Success
        , Text              : ''
        , Data              :
        [{
              ProductID     : product.ID
            , SellerID       : seller.ID
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

let Modify = function(seller_, product_) 
{
  this.SellerID   = seller_
  this.ProductID = product_
  this.Data      = function()
  {
    let seller   = data.Get(data.Obj.Seller,   this.SellerID)
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
          , Header            : { Authorization: seller.Token }
      }
      , Response              :
      {
            Code              : Model.code.OK
          , Status            : Model.status.Success
          , Text              : Model.text.ProductUpdated
          , Data              : {}
      }
    }
    return templ
  }
}

let Remove = function(seller_, product_) 
{
  this.SellerID   = seller_
  this.ProductID = product_
  this.Data      = function()
  {
    let seller   = data.Get(data.Obj.Seller,   this.SellerID)
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
          , Header            : { Authorization: seller.Token }
      }
      , Response              :
      {
            Code              : Model.code.OK
          , Status            : Model.status.Success
          , Text              : Model.text.ProductRemoved
          , Data              : {}
      }
    }
    return templ
  }
}

module.exports = { Add, View, List, Modify, Remove }