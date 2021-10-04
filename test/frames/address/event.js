const { Method, Type }       = require('../../lib/medium')
    , data                   = require('../data')
    , { code, status, text } = require('../../../pkg/system/models')

let Add = function(user_, addr_) 
{
  this.UserID  	  = user_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
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
        , Header         : { Authorization: user.Token }
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

let View = function(user_, addr_) 
{
  this.UserID  	  = user_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
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
          , Header           : { Authorization: user.Token }
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
    return templ
  }
}

let List = function(user_, addr_) 
{
  this.UserID  	  = user_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
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
          , Header           : { Authorization: user.Token }
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
    return templ
  }
}

let Update = function(user_, addr_) 
{
  this.UserID  	  = user_
  this.AddressID  = addr_
  this.Data     = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
    let addr  = data.Get(data.Obj.Address, this.AddressID)
    let templ =
    {
        Type                   : Type.Rest
      , Describe               : 'Address Update'
      , Request                :
      {
            Method             : Method.POST
          , Path               : '/v1/address/modify'
          , Body               : 
          {
              AddressID      : addr.ID
            , Longitude      : addr.Longitude
            , Latitude       : addr.Latitude
            , Tag            : 'OFFICE'
            , IsDefault      : addr.IsDefault
            , Address        :
            {
                Name         : addr.Address.Name
              , Line1        : addr.Address.Line1
              , Line2        : addr.Address.Line2
              , City         : addr.Address.City
              , PostalCode   : addr.Address.PostalCode
              , State        : addr.Address.State
              , Country      : addr.Address.Country
            }
          }
          , Header           : { Authorization: user.Token }
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

let Remove = function(user_, addr_) 
{
  this.UserID  	  = user_
  this.AddressID  = addr_
  this.Data       = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
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
          , Header           : { Authorization: user.Token }
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