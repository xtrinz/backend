const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")

let Add = function(product)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Product Add'
    , Request               :
    {
          Method            : Method.POST
        , Path              : '/product/add'
        , Body              : 
        {
              StoreID       : ''
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , Description   : product.Description
            , CategoryID    : product.CategoryID
        }
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : text.ProductAdded
        , Data              : {}
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.StoreID = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Modify = function(product)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Product Modify'
    , Request               :
    {
          Method            : Method.POST
        , Path              : '/product/modify'
        , Body              : 
        {
        	  ProductID       : ''
            , StoreID       : ''
            , Name          : product.Name
            , Image         : product.Image
            , Price         : 200
            , Quantity      : product.Quantity
            , Description   : product.Description
            , CategoryID    : product.CategoryID
        }
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : text.ProductUpdated
        , Data              : {}
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.StoreID   = resp.Data.StoreID
    data.Request.Body.ProductID = resp.Data.ProductID    
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let View = function(product)
{
  this.Data =
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
              ProductID     : ''
        }
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : ''
        , Data              :
        {
              _id           : ''
            , StoreID       : ''
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

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Response.Data.StoreID  = resp.Data.StoreID
    data.Response.Data._id      = resp.Data.ProductID
    data.Request.Query.ProductID = resp.Data.ProductID        
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let List = function(product)
{
  this.Data =
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
            StoreID         : ''
        }
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : ''
        , Data              :
        [{
              _id           : ''
            , StoreID       : ''
            , Name          : product.Name
            , Image         : product.Image
            , Price         : product.Price
            , Quantity      : product.Quantity
            , Description   : product.Description
            , CategoryID    : product.CategoryID
        }]
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Response.Data[0].StoreID = resp.Data.StoreID
    data.Response.Data[0]._id     = resp.Data.ProductID
    data.Request.Query.StoreID = resp.Data.StoreID        
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Remove = function(product)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Product Remove'
    , Request               :
    {
          Method            : Method.DELETE
        , Path              : '/product/remove'
        , Body              : 
        {
              ProductID     : ''
            , StoreID       : ''
        }
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : text.ProductRemoved
        , Data              : {}
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.StoreID   = resp.Data.StoreID
    data.Request.Body.ProductID = resp.Data.ProductID    
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

module.exports =
{
    Add, Modify, View, List, Remove
}