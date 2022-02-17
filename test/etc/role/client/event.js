const Model            = require('../../../../pkg/sys/models')
    , { Method, Type } = require('../../../lib/medium')
    , { read }         = require('../../../lib/driver')
    , data             = require('../../data')
    , jwt              = require('../../../../pkg/infra/jwt')

let RegisterNew = function(client) 
{
    this.ClientID     = client
    this.Data   = function()
    {
      let client  = data.Get(data.Obj.Client, this.ClientID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Client Register New'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/client/register'
          , Body       : 
          {
              Task     : Model.task.New
            , MobileNo : client.MobileNo
          }
          , Header     : {}
        }
        , Skip         : []
        , Response     :
        {
            Code       : Model.code.OK
          , Status     : Model.status.Success
          , Text       : Model.text.OTPGenerated
          , Data       : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , client  = data.Get(data.Obj.Client, this.ClientID)
      client.OTP  = resp.Data.OTP
      data.Set(data.Obj.Client, this.ClientID, client)
    }
}

let RegisterReadOTP = function(client, journal) 
{
    this.ClientID     = client
    this.JournalID  = journal
    this.Data   = function()
    {
      let client  = data.Get(data.Obj.Client, this.ClientID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Client Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/client/register'
          , Body       : 
          {
              Task     : Model.task.ReadOTP
            , MobileNo : client.MobileNo
            , OTP      : client.OTP
          }
          , Header     : {}
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : Model.code.OK
          , Status     : Model.status.Success
          , Text       : Model.text.OTPConfirmed
          , Data       : { Token: '', Command: Model.command.Register }
        }
      }
      return templ
  }
  this.PostSet        = async function(res_)
  {

    let journal = data.Get(data.Obj.Journal, this.JournalID)

    let client   = data.Get(data.Obj.Client,   this.ClientID)
      , data_   = await jwt.Verify(res_.Data.Token)
    client.ID    = data_._id
    client.Token = res_.Data.Token
    data.Set(data.Obj.Client, this.ClientID, client)

    journal.Client.ID = client.ID

    data.Set(data.Obj.Journal, this.JournalID, journal)
  }
}

let Register = function(client) 
{
    this.ClientID     = client
    this.Data   = function()
    {
      let client  = data.Get(data.Obj.Client, this.ClientID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Client Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/client/register'
          , Body          : 
          {
              Task        : Model.task.Register
            , MobileNo    : client.MobileNo
            , Name        : client.Name
            , Email       : client.Email
          }
          , Header        :
          {
            Authorization : client.Token
          }
        }
        , Response        :
        {
            Code          : Model.code.OK
          , Status        : Model.status.Success
          , Text          : Model.text.Registered
          , Data          :
          {
              Name        : client.Name
            , MobileNo    : client.MobileNo
            , Email       : client.Email
            , Mode        : client.Mode
            , Command     : Model.command.LoggedIn
          }
        }
      }
      return templ
    }
}

let Connect = function(client) 
{
    this.ClientID     = client
    this.Data   = function()
    {
      let client  = data.Get(data.Obj.Client, this.ClientID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Client Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : client.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ClientID.startsWith('Agent1')) { await read() }
      let client    = data.Get(data.Obj.Client, this.ClientID)
      client.Socket = res_.Socket
      client.Channel= res_.Channel
      data.Set(data.Obj.Client, this.ClientID, client)
    }
}

let ProfileGet = function(client) 
{
  this.ClientID     = client
  this.Data   = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Client Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/client/view'
        , Body          : {}
        , Header        :
        {
          Authorization : client.Token
        }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
        , Text          : ''
        , Data          : 
        {
            Name        : client.Name
          , MobileNo    : client.MobileNo
          , Email       : client.Email
          , Mode        : client.Mode
        }
      }
    }
    return templ
  }
}

let ProfileEdit =  function(client) 
{
  this.ClientID     = client
  this.Data   = function()
  {
    let client  = data.Get(data.Obj.Client, this.ClientID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Client Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/client/edit'
        , Body          : 
        {                   
            Name        : client.Name
          , Email       : client.Email
          , Longitude   : client.Longitude
          , Latitude    : client.Latitude               
        }                   
        , Header        :
        {                   
          Authorization : client.Token
        }                   
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

let Dsc = function(client) 
{
    this.ClientID     = client
    this.Data   = function()
    {
      let client  = data.Get(data.Obj.Client, this.ClientID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Client Socket Dsc'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : client.Socket
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
}

module.exports =
{
      RegisterNew   , RegisterReadOTP  , Register
    , Connect       , ProfileGet       , ProfileEdit
    , Dsc
}