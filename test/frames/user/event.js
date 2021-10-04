const { task, code, status, text } = require('../../../pkg/system/models')
    , { Method, Type }             = require('../../lib/medium')
    , { read }                     = require('../../lib/driver')
    , data                         = require('../data')

let RegisterNew = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'User Register New'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/user/register'
          , Body       : 
          {
              Task     : task.New
            , MobileNo : user.MobileNo
            , Mode     : user.Mode
            , Longitude: user.Longitude
            , Latitude : user.Latitude            
          }
          , Header     : {}
        }
        , Skip         : []
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPSendToMobileNo.format(
                          user.MobileNo.substr(
                          user.MobileNo.length - 4))
          , Data       : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , user  = data.Get(data.Obj.User, this.ID)
      user.OTP  = resp.Data.OTP
      data.Set(data.Obj.User, this.ID, user)
    }
}

let RegisterReadOTP = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'User Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/user/register'
          , Body       : 
          {
              Task     : task.ReadOTP
            , MobileNo : user.MobileNo
            , OTP      : user.OTP
          }
          , Header     : {}
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPConfirmed
          , Data       : { Token: '' }
        }
      }
      return templ
  }
  this.PostSet        = async function(res_)
  {
    let user   = data.Get(data.Obj.User, this.ID)
    user.Token = res_.Data.Token
    data.Set(data.Obj.User, this.ID, user)
  }
}

let Register = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'User Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/user/register'
          , Body          : 
          {
              Task        : task.Register
            , MobileNo    : user.MobileNo
            , Name        : user.Name
            , Email       : user.Email
          }
          , Header        :
          {
            Authorization : user.Token
          }
        }
        , Response        :
        {
            Code          : code.OK
          , Status        : status.Success
          , Text          : text.Registered
          , Data          :
          {
              Name        : user.Name
            , MobileNo    : user.MobileNo
            , Email       : user.Email
            , Mode        : user.Mode
          }
        }
      }
      return templ
    }
}

let Connect = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'User Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : user.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ID.startsWith('Agent1')) { await read() }
      let user    = data.Get(data.Obj.User, this.ID)
      user.Socket = res_.Socket
      user.Channel= res_.Channel
      data.Set(data.Obj.User, this.ID, user)
    }
}

let ProfileGet = function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'User Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/user/profile'
        , Body          : {}
        , Header        :
        {
          Authorization : user.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          : 
        {
            Name        : user.Name
          , MobileNo    : user.MobileNo
          , Email       : user.Email
          , Mode        : user.Mode
        }
      }
    }
    return templ
  }
}

let ProfileEdit =  function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'User Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/user/profile'
        , Body          : 
        {                   
            Name        : user.Name
          , Email       : user.Email
        }                   
        , Header        :
        {                   
          Authorization : user.Token
        }                   
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

let Disconnect = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'User Socket Disconnect'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : user.Socket
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
    , Connect
    , ProfileGet
    , ProfileEdit
    , Disconnect
}