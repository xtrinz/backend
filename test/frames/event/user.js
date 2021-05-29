const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , { task }                = require("../../../pkg/common/models")
    , { code, status, text }  = require("../../../pkg/common/error")
    , jwt                     = require("../../../pkg/common/jwt")

let RegisterNew = function(user) 
{
    this.Data =
    {
          Type           : Type.Rest
        , Describe       : 'User Register New'
        , Request        :
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
        , Response       :
        {
              Code       : code.OK
            , Status     : status.Success
            , Text       : text.OTPSendToMobNo.format(
                            user.MobileNo.substr(
                            user.MobileNo.length - 4))
            , Data       : {}
        }
    }
}

let RegisterReadOTP = function(user)
{
  this.Data =
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
        , OTP      : ''
      }
      , Header     : {}
    }
    , Response     :
    {
        Code       : code.OK
      , Status     : status.Success
      , Text       : text.OTPConfirmed
      , Data       : ''
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
    data.Request.Body.OTP = resp.Data.OTP
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Response.Data = {Token : token}
    return data
  }
}

let Register = function(user)
{
  this.Data =
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
        Authorization : ''
      }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : text.Registered
      , Data          : {}
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = 
    {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp  = await Rest(req)
      , token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let Login = function(user)
{
  this.Data =
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
      , Data  : { Token : '' }
    }
  }

  this.PreSet        = async function(data)
  {
    console.log(prints.ReadParam)
    let req = 
    {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp  = await Rest(req)
      , token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Response.Data = {Token : token}
    return data
  }
}

let PasswordGenOTP = function(user)
{
  this.Data =
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
}

let PasswordConfirmMobNo = function(user)
{
  this.Data =
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
        , OTP      : ''
      }            
      , Header     : {}
    }
    , Response     :
    {               
        Code       : code.OK
      , Status     : status.Success
      , Text       : text.OTPConfirmed
      , Data       : ''
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
    data.Request.Body.OTP = resp.Data.OTP
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Response.Data = {Token : token}
    return data
  }
}

let PasswordSet = function(user)
{
  this.Data =
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
        Authorization : ''
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

let ProfileGet = function(user)
{
  this.Data =
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
        Authorization : ''
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

let ProfileEdit = function(user)
{
  this.Data =
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
        Authorization : ''
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

module.exports =
{
      RegisterNew     , RegisterReadOTP      , Register    // User registration sequence
    , Login                                                // Login
    , PasswordGenOTP  , PasswordConfirmMobNo , PasswordSet // Forgot password sequence
    , ProfileGet      , ProfileEdit                        // Profile Read & Edit
}