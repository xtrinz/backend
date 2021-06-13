const { task }               = require("../../../pkg/common/models")
    , { code, status, text } = require("../../../pkg/common/error")
    , { Method, Type }       = require("../../lib/medium")
    , { read }               = require("../../lib/driver")
    , data                   = require("../data/data")

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
          , Path       : '/user/register'
          , Body       : 
          {
              Task     : task.New
            , MobileNo : user.MobileNo
            , Mode     : user.Mode
          }
          , Header     : {}
        }
        , Skip         : []
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPSendToMobNo.format(
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
          , Path       : '/user/register'
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
          , Path          : '/user/register'
          , Body          : 
          {
              Task        : task.Register
            , MobileNo    : user.MobileNo
            , Name        : user.Name
            , Email       : user.Email
            , Password    : user.Password
          }
          , Header        :
          {
            Authorization : 'Bearer ' + user.Token
          }
        }
        , Skip            : []
        , Response        :
        {
            Code          : code.OK
          , Status        : status.Success
          , Text          : text.Registered
          , Data          : {}
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
        , Authorization : {'auth' : {Token : 'Bearer ' + user.Token }}
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

let Login = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =
      {
          Type      : Type.Rest
        , Describe  : 'User Login'
        , Request   :
        {
            Method : Method.POST
          , Path   : '/user/login'
          , Body   : 
          {
              MobileNo : user.MobileNo
            , Password : user.Password
          }
          , Header: {}
        }
        , Response  :
        {
            Code  : code.OK
          , Status: status.Success
          , Text  : text.LoggedIn
          , Data  : { Token : user.Token }
        }
      }
      return templ
    }
}

let PasswordGenOTP = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'User Password Generate_OTP'
        , Request      :
        {              
            Method     : Method.POST
          , Path       : '/user/passwd/reset'
          , Body       : 
          {              
              MobileNo : user.MobileNo
            , Password : user.Password
            , Task     : task.GenOTP
          }              
          , Header     : {}
        }              
        , Response     :
        {              
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPSendVia.format((user.MobileNo)? 'SMS': 'MAIL')
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

let PasswordConfirmMobNo = function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.ID)
    let templ =
    {
        Type         : Type.Rest
      , Describe     : 'User Password Confirm_OTP'
      , Request      :
      {               
          Method     : Method.POST
        , Path       : '/user/passwd/reset'
        , Body       : 
        {            
            Task     : task.ConfirmOTP
          , MobileNo : user.MobileNo
          , OTP      : user.OTP
        }            
        , Header     : {}
      }
      , Response     :
      {               
          Code       : code.OK
        , Status     : status.Success
        , Text       : text.OTPConfirmed
        , Data       : {Token : user.Token}
      }
    }
    return templ
  }
}

let PasswordSet = function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'User Password Set_Password'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/user/passwd/reset'
        , Body          : 
        {
            Task        : task.SetPassword
          , Password    : user.Password
        }
        , Header        :
        {
          Authorization : 'Bearer ' + user.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.PasswdUpdated
        , Data          : {}
      }
    }
    return templ
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
        , Path          : '/user/profile'
        , Body          : {}
        , Header        :
        {
          Authorization : 'Bearer ' + user.Token
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
        , Path          : '/user/profile'
        , Body          : 
        {                   
            Password    : user.Password
          , NewPassword : user.Password
          , Name        : user.Name
          , Email       : user.Email
        }                   
        , Header        :
        {                   
          Authorization : 'Bearer ' + user.Token
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
    , Login
    , PasswordGenOTP
    , PasswordConfirmMobNo
    , PasswordSet
    , ProfileGet
    , ProfileEdit
    , Disconnect
}