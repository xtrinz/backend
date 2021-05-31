const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")

let Add = function(addr)
{
  this.Data =
  {
      Type                : Type.Rest
    , Describe            : 'Address Add'
    , Request             :
    {
          Method          : Method.POST
        , Path            : '/address/add'
        , Body            : 
        {
              Longitude   : addr.Longitude
            , Latitude    : addr.Latitude
            , Tag         : addr.Tag
            , IsDefault   : addr.IsDefault
            , Address     :
            {
                   Name       : addr.Address.Name
                , Line1       : addr.Address.Line1
                , Line2       : addr.Address.Line2
                , City        : addr.Address.City
                , PostalCode  : addr.Address.PostalCode
                , State       : addr.Address.State
                , Country     : addr.Address.Country
            }
        }
        , Header          : { Authorization: '' }
    }
    , Response            :
    {
          Code            : code.OK
        , Status          : status.Success
        , Text            : text.AddressAdded
        , Data            : {}
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
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let View = function(addr)
{
  this.Data =
  {                                  
      Type                 : Type.Rest
    , Describe             : 'Address View'
    , Request              :
    {                                   
          Method           : Method.GET
        , Path             : '/address/view'
        , Body             : {}
        , Query            :
        {                                   
              AddressID    : ''
        }                          
        , Header           : { Authorization: '' }
    }                                   
    , Response             :
    {                                   
          Code             : code.OK
        , Status           : status.Success
        , Text             : ''
        , Data             : 
        {                  
              _id          : '' 
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
    this.Data.Request.Query.AddressID  = resp.Data.AddressID
    this.Data.Response.Data._id        = resp.Data.AddressID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let List = function(addr)
{
  this.Data =
  {                                  
      Type                 : Type.Rest
    , Describe             : 'Address List'
    , Request              :
    {                                   
          Method           : Method.GET
        , Path             : '/address/list'
        , Body             : {}
        , Query            : {}
        , Header           : { Authorization: '' }
    }                                   
    , Response             :
    {                                   
          Code             : code.OK
        , Status           : status.Success
        , Text             : ''
        , Data             : 
        [{                  
              _id          : '' 
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
    this.Data.Response.Data[0]._id        = resp.Data.AddressID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Update = function(addr)
{
  this.Data =
  {
      Type                   : Type.Rest
    , Describe               : 'Address Update'
    , Request                :
    {
          Method             : Method.POST
        , Path               : '/address/modify'
        , Body               : 
        {
              AddressID      : ''
            , Longitude      : addr.Longitude
            , Latitude       : addr.Latitude
            , Tag            : addr.Tag
            , IsDefault      : addr.IsDefault
            , Address        :
            {
                 Name        : addr.Address.Name
              , Line1        : addr.Address.Line1
              , Line2        : addr.Address.Line2
              , City         : addr.Address.City
              , PostalCode   : addr.Address.PostalCode
              , State        : addr.Address.State
              , Country      : addr.Address.Country
            }
        }
        , Header             : { Authorization: '' }
    }
    , Response               :
    {
          Code               : code.OK
        , Status             : status.Success
        , Text               : text.AddressUpdated
        , Data               : {}
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
    this.Data.Request.Body.AddressID  = resp.Data.AddressID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

let Remove = function(addr)
{
  this.Data =
  {                                  
      Type                 : Type.Rest
    , Describe             : 'Address Remove'
    , Request              :
    {                                   
          Method           : Method.DELETE
        , Path             : '/address/remove'
        , Body             :
        {                                   
              AddressID    : ''
        }                          
        , Header           : { Authorization: '' }
    }                                   
    , Response             :
    {                                   
          Code             : code.OK
        , Status           : status.Success
        , Text             : text.AddressRemoved
        , Data             : {}
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
    this.Data.Request.Body.AddressID  = resp.Data.AddressID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }

}

module.exports =
{
    Add, View, List, Update, Remove
}