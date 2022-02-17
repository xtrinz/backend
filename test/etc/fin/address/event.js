const { Method, Type }       = require('../../../lib/medium')
    , data                   = require('../../data')
    , { code, status, text } = require('../../../../pkg/sys/models')

let Add = function(client_, addr_) 
{
  this.ClientID  	  = client_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {
        Type             : Type.Rest
      , Describe         : 'Address Add'
      , Request          :
      {
          Method         : Method.POST
        , Path           : '/v1/address/add'
        , Body           : 
        {
            Longitude    : addr.Longitude
          , Latitude     : addr.Latitude
          , Tag          : addr.Tag
          , IsDefault    : addr.IsDefault
          , Name         : addr.Name
          , Line1        : addr.Line1
          , Line2        : addr.Line2
          , City         : addr.City
          , PostalCode   : addr.PostalCode
          , State        : addr.State
          , Country      : addr.Country
        }
        , Header         : { Authorization: client.Token }
      }
      , Skip             : [ 'AddressID' ]
      , Response         :
      {
            Code         : code.OK
          , Status       : status.Success
          , Text         : text.AddressAdded
          , Data         : { AddressID : '' }
      }
    }
    return templ
  }

  this.PostSet = async function(res_)
  {
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    addr.ID  = res_.Data.AddressID
    data.Set(data.Obj.Address, this.AddressID, addr)
  }
}

let View = function(client_, addr_) 
{
  this.ClientID  	  = client_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {                                  
        Type                 : Type.Rest
      , Describe             : 'Address View'
      , Request              :
      {                                   
            Method           : Method.GET
          , Path             : '/v1/address/view'
          , Body             : {}
          , Query            :
          {                                   
                AddressID    : addr.ID
          }                          
          , Header           : { Authorization: client.Token }
      }                                   
      , Response             :
      {                                   
            Code             : code.OK
          , Status           : status.Success
          , Text             : ''
          , Data             : 
          {                  
                AddressID    : addr.ID 
              , Longitude    : addr.Longitude
              , Latitude     : addr.Latitude
              , Tag          : addr.Tag
              , IsDefault    : addr.IsDefault
              , Name         : addr.Name
              , Line1        : addr.Line1
              , Line2        : addr.Line2
              , City         : addr.City
              , PostalCode   : addr.PostalCode
              , State        : addr.State
              , Country      : addr.Country
          }
      }
    }
    return templ
  }
}

let List = function(client_, addr_) 
{
  this.ClientID  	  = client_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {                                  
        Type                 : Type.Rest
      , Describe             : 'Address List'
      , Request              :
      {                                   
            Method           : Method.GET
          , Path             : '/v1/address/list'
          , Body             : {}
          , Query            : {}
          , Header           : { Authorization: client.Token }
      }                                   
      , Response             :
      {                                   
            Code             : code.OK
          , Status           : status.Success
          , Text             : ''
          , Data             : 
          [{                  
                AddressID    : addr.ID
              , Longitude    : addr.Longitude
              , Latitude     : addr.Latitude
              , Tag          : addr.Tag
              , IsDefault    : addr.IsDefault
              , Name         : addr.Name
              , Line1        : addr.Line1
              , Line2        : addr.Line2
              , City         : addr.City
              , PostalCode   : addr.PostalCode
              , State        : addr.State
              , Country      : addr.Country
          }]
      }
    }
    return templ
  }
}

let Update = function(client_, addr_) 
{
  this.ClientID  	  = client_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {
        Type                 : Type.Rest
      , Describe             : 'Address Update'
      , Request              :
      {
            Method           : Method.PUT
          , Path             : '/v1/address/modify'
          , Body             : 
          {
              AddressID      : addr.ID
            , Longitude      : addr.Longitude
            , Latitude       : addr.Latitude
            , Tag            : 'OFFICE'
            , IsDefault      : addr.IsDefault
            , Name           : addr.Name
            , Line1          : addr.Line1
            , Line2          : addr.Line2
            , City           : addr.City
            , PostalCode     : addr.PostalCode
            , State          : addr.State
            , Country        : addr.Country
          }
          , Header           : { Authorization: client.Token }
      }
      , Response             :
      {
          Code               : code.OK
        , Status             : status.Success
        , Text               : text.AddressUpdated
        , Data               : {}
      }
    }
    return templ
  }
}

let Remove = function(client_, addr_) 
{
  this.ClientID  	  = client_
  this.AddressID  = addr_
  this.Data       = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {                                  
        Type                 : Type.Rest
      , Describe             : 'Address Remove'
      , Request              :
      {                                   
            Method           : Method.DELETE
          , Path             : '/v1/address/remove'
          , Body             :
          {                                   
                AddressID    : addr.ID
          }                          
          , Header           : { Authorization: client.Token }
      }                                   
      , Response             :
      {                                   
            Code             : code.OK
          , Status           : status.Success
          , Text             : text.AddressRemoved
          , Data             : {}
      }
    }
    return templ
  }
}

module.exports =
{
    Add, View, List, Update, Remove
}