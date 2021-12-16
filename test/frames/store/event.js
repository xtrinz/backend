const { Method, Type } = require('../../lib/medium')
    , data             = require('../data')
    , { read }         = require('../../lib/driver')
    , Model            = require('../../../pkg/system/models')
    , jwt              = require('../../../pkg/infra/jwt')

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
                Task            : Model.task.New
              , MobileNo        : store.MobileNo
            }
            , Header            : {}
        }
        , Response              :
        {
              Code              : Model.code.OK
            , Status            : Model.status.Success
            , Text              : Model.text.OTPGenerated
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

let RegisterReadOTP = function(store_, journal_) 
{
  this.StoreID  = store_
  this.JournalID = journal_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
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
              Task     : Model.task.ReadOTP
            , MobileNo : store.MobileNo
            , OTP      : store.OTP
          }
          , Header     : {  }
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : Model.code.OK
          , Status     : Model.status.Success
          , Text       : Model.text.OTPConfirmed
          , Data       : { Token : '', Command: Model.command.Register }
        }

    } 
    return templ
  }
  this.PostSet        = async function(res_)
  {
    let journal = data.Get(data.Obj.Journal, this.JournalID)

    let store   = data.Get(data.Obj.Store,   this.StoreID)
      , data_   = await jwt.Verify(res_.Data.Token)
    store.ID    = data_._id
    store.Token = res_.Data.Token
    data.Set(data.Obj.Store, this.StoreID, store)

    journal.Store.ID = store.ID

    data.Set(data.Obj.Journal, this.JournalID, journal)
  }  
}

let Register = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let store  = data.Get(data.Obj.Store, this.ID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Store Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/store/register'
          , Body          : 
          {
              Task            : Model.task.Register
            , Name            : store.Name
            , Image           : store.Image
            , Type            : store.Type
            , Certs           : store.Certs
            , Description     : store.Description
            , MobileNo        : store.MobileNo
            , Email           : store.Email
            , ClosingTime     : store.ClosingTime
            , Address         :
            {
                  Line1       : store.Address.Line1
                , Line2       : store.Address.Line2
                , City        : store.Address.City
                , Longitude   : store.Address.Longitude
                , Latitude    : store.Address.Latitude
                , PostalCode  : store.Address.PostalCode
                , State       : store.Address.State
                , Country     : store.Address.Country
            }
          }
          , Header        :
          {
            Authorization : store.Token
          }
        }
        , Response        :
        {
            Code          : Model.code.OK
          , Status        : Model.status.Success
          , Text          : Model.text.Registered
          , Data          :
          {
              StoreID      : store.ID
            , Name         : store.Name
            , MobileNo     : store.MobileNo
            , Image        : store.Image
            , Description  : store.Description
            , Type         : store.Type
            , Certs        : store.Certs
            , Address      :
            {
                Line1      : store.Address.Line1
              , Line2      : store.Address.Line2
              , City       : store.Address.City
              , Longitude  : store.Address.Longitude
              , Latitude   : store.Address.Latitude
              , PostalCode : store.Address.PostalCode
              , State      : store.Address.State
              , Country    : store.Address.Country
            }
            , ClosingTime  : store.ClosingTime
            , Email        : store.Email
            , State        : 'ToBeApproved'
            , Status       : Model.states.Closed
            , Command      : Model.command.LoggedIn
          }
        }
      }
      return templ
    }
}

let RegisterApprove =  function(admin_, store_) 
{
  this.AdminID  = admin_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let admin = data.Get(data.Obj.Admin, this.AdminID)
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
            Task        : Model.task.Approve
          , StoreID     : store.ID
          , Action      : Model.task.Approve
        //, Action      : Model.task.Deny
        //, Text        : "Please correct ASDF Field"
        }
        , Header        :
        {
          Authorization : admin.Token
        }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : Model.text.Approved
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
          Code           : Model.code.OK
        , Status         : Model.status.Success
        , Text           : ''
        , Data           :
        {
            StoreID      : store.ID
          , Name         : store.Name
          , Image        : store.Image
          , Description  : store.Description
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
          , ClosingTime  : store.ClosingTime          
          , Status       : store.Status
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
          , Category    : store.Type
          , Text        : 'Store'
        }
        , Body          : { }
        , Header        : { Authorization : user.Token }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : ''
        , Data          :
          [{
              StoreID     : store.ID
            , Name        : store.Name
            , Image       : store.Image
            , Description : store.Description            
            , Type        : store.Type
            , ClosingTime : store.ClosingTime            
            , Status      : store.Status
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
          , Description : store.Description
          , Longitude   : store.Longitude
          , Latitude    : store.Latitude
          , ClosingTime : store.ClosingTime
          , Status      : store.Status
          //, Refeed      : true
        }
        , Header        : { Authorization : store.Token }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : Model.text.ProfileUpdated
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
        , Describe      : 'Store Socket Connect'
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

let Dsc = function(store_) 
{
    this.ID     = store_
    this.Data   = function()
    {
      let store  = data.Get(data.Obj.Store, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Store Socket Dsc'
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
    , Register
    , RegisterApprove // Store registration sequence
    , Read            
    , List            // Read store
    , Edit
    , Connect
    , Dsc
}