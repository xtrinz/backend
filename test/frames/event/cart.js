const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")

let Insert = function(crt_entry)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Cart Insert'
    , Request               :
    {
          Method            : Method.POST
        , Path              : '/cart/insert'
        , Body              : 
        {
                ProductID  : ''
              , StoreID     : ''
              , Quantity    : crt_entry.Quantity
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
    data.Request.Body.ProductID  = resp.Data.ProductID    
    data.Request.Body.StoreID    = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let List = function(crt_entry, product)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Cart List'
    , Request               :
    {
          Method            : Method.GET
        , Path              : '/cart/list'
        , Body              : {}
        , Header            : { Authorization: '' }
    }
    , Response              :
    {
          Code              : code.OK
        , Status            : status.Success
        , Text              : ''
        , Data              : 
        {
              Products      : 
              [{
                  ProductID : ''
                , Name      : product.Name
                , Price     : product.Price
                , Image     : product.Image
                , Quantity  : crt_entry.Quantity
              }]
            , Bill          : 
            {
                Total       : crt_entry.Quantity * product.Price
              , TransitCost : 0
              , Tax         : 0
              , NetPrice    : crt_entry.Quantity * product.Price
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
    data.Response.Data.Products[0].ProductID  = resp.Data.ProductID    
    data.Request.Body.StoreID                 = resp.Data.StoreID    
    data.Request.Body.ProductID               = resp.Data.ProductID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Update = function(crt_entry)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Cart Update'
    , Request               :
    {
          Method            : Method.POST
        , Path              : '/cart/modify'
        , Body              : 
        {
                EntryID     : ''
              , Quantity    : crt_entry.Quantity + 1
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
    data.Request.Body.EntryID  = resp.Data.EntryID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Remove = function(crt_entry)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Cart Remove'
    , Request               :
    {
          Method            : Method.DELETE
        , Path              : '/cart/remove'
        , Body              : 
        {
             EntryID        : ''
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
    data.Request.Body.EntryID  = resp.Data.EntryID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

module.exports =
{
    Insert, List, Update, Remove
}