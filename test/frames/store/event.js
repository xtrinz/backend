const { Method, Type }             = require('../../lib/medium')
    , data                         = require('../data')
    , { read }                     = require('../../lib/driver')
    , { code, status, text, task } = require('../../../pkg/system/models')
    , jwt                          = require('../../../pkg/infra/jwt')

let RegisterNew = function(store_) 
{
    this.StoreID  = store_
    this.Data     = function()
    {
      let store = data.Get(data.Obj.Store, this.StoreID)
      let templ =
      {
          Type                  : Type.Rest
        , Describe              : 'Store Register New'
        , Request               :
        {
              Method            : Method.POST
            , Path              : '/v1/store/register'
            , Body              : 
            {
                Task            : task.New
              , Name            : store.Name
              , Image           : store.Image
              , Type            : store.Type
              , Certs           : store.Certs
              , MobileNo        : store.MobileNo
              , Email           : store.Email
              , Longitude       : store.Longitude
              , Latitude        : store.Latitude
              , Address         :
              {
                    Line1       : store.Address.Line1
                  , Line2       : store.Address.Line2
                  , City        : store.Address.City
                  , PostalCode  : store.Address.PostalCode
                  , State       : store.Address.State
                  , Country     : store.Address.Country
              }
            }
            , Header            : {}
        }
        , Response              :
        {
              Code              : code.OK
            , Status            : status.Success
            , Text              : text.OTPSendToMobileNo.format(
                                    store.MobileNo.substr(
                                    store.MobileNo.length - 4))
            , Data              : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , store = data.Get(data.Obj.Store, this.StoreID)
      store.OTP = resp.Data.OTP
      data.Set(data.Obj.Store, this.StoreID, store)
    }
}

let RegisterReadOTP = function(user_, store_) 
{
  this.UserID   = user_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let user  = data.Get(data.Obj.User , this.UserID )      
    let templ =
    {
          Type         : Type.Rest
        , Describe     : 'Store Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/store/register'
          , Body       : 
          {
              Task     : task.ReadOTP
            , MobileNo : store.MobileNo
            , OTP      : store.OTP
          }
          , Header     : { Authorization: user.Token }
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPConfirmed
          , Data       : { Token : '' }
        }

    } 
    return templ
  }
  this.PostSet        = async function(res_)
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
      data_ = await jwt.Verify(res_.Data.Token)
      store.ID    = data_._id
      store.Token = res_.Data.Token
    data.Set(data.Obj.Store, this.StoreID, store)
  }  
}

let RegisterApprove =  function(admin_, store_) 
{
  this.AdminID  = admin_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let admin = data.Get(data.Obj.User, this.AdminID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Register Approve'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/v1/store/register'
        , Body          : 
        {
            Task        : task.Approve
          , StoreID     : store.ID
        }
        , Header        :
        {
          Authorization : admin.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.Approved
        , Data          : {}
      }
    }
    return templ
  }
}

let Read =   function(user_, store_) 
{
  this.UserID   = user_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let user  = data.Get(data.Obj.User, this.UserID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store View'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/store/view'
        , Body          : {}
        , Query         : { StoreID     : store.ID }
        , Header        : { Authorization : user.Token }
      }
      , Response         :
      {
          Code           : code.OK
        , Status         : status.Success
        , Text           : ''
        , Data           :
        {
            StoreID      : store.ID
          , Name         : store.Name
          , Image        : store.Image
          , Type         : store.Type
          , Certs        : store.Certs
          , Address      :
          {
              Line1      : store.Address.Line1
            , Line2      : store.Address.Line2
            , City       : store.Address.City
            , PostalCode : store.Address.PostalCode
            , State      : store.Address.State
            , Country    : store.Address.Country
          }
        }
      }
    }
    return templ
  }
}

let List = function(user_, store_) 
{
  this.UserID   = user_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let user  = data.Get(data.Obj.User, this.UserID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store List'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/store/list'
        , Query         :
        {
            Longitude   : '17.20000'
          , Latitude    : '17.20000'
          , Page        : 1
          , Limit       : 8
        }
        , Body          : { }
        , Header        : { Authorization : user.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          :
          [{
              StoreID : store.ID
            , Name    : store.Name
            , Image   : store.Image
            , Type    : store.Type
          }]
      }
    }
    return templ
  }
}

let Edit = function(store_) 
{
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Edit'
      , Request         :
      {
          Method        : Method.PUT
        , Path          : '/v1/store/edit'
        , Query         : {}
        , Body          : 
        {
            Email       : store.Email
          , Image       : store.Image
          , Certs       : store.Certs
          , Type        : store.Type
          , Name        : store.Name
          , Longitude   : store.Longitude
          , Latitude    : store.Latitude 
        }
        , Header        : { Authorization : store.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.ProfileUpdated
        , Data          : {}
      }
    }
    return templ
  }
}

let Connect = function(store_) 
{
    this.ID     = store_
    this.Data   = function()
    {
      let store  = data.Get(data.Obj.Store, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'User Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : store.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ID.startsWith('Store')) { await read() } // TODO bug
      let store    = data.Get(data.Obj.Store, this.ID)
      store.Socket = res_.Socket
      store.Channel= res_.Channel
      data.Set(data.Obj.Store, this.ID, store)
    }
}

let Disconnect = function(store_) 
{
    this.ID     = store_
    this.Data   = function()
    {
      let store  = data.Get(data.Obj.Store, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'User Socket Disconnect'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : store.Socket
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
}



module.exports =
{
      RegisterNew     
    , RegisterReadOTP 
    , RegisterApprove // Store registration sequence
    , Read            
    , List            // Read store
    , Edit
    , Connect
    , Disconnect
}