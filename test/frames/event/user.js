const { Method, Type, Rest }  = require("../../lib/medium")
    , { task, mode }          = require("../../../pkg/common/models")
    , { code, status, text }  = require("../../../pkg/common/error")
    , jwt                     = require("../../../pkg/common/jwt")

let user =
{
    MobileNo  : '+915660844848'
  , Name      : 'User-1'
  , Email     : 'user@domain.com'
  , Password  : 'protected'
  , Mode      : 'User'
}

let reg_new = 
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
          , Mode     : mode.User
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

let reg_readotp = 
{
    Type      : Type.Rest
  , Describe  : 'User Register Read_OTP'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/user/register'
    , Body   : 
    {
        Task     : task.ReadOTP
      , MobileNo : user.MobileNo
      , OTP      : ''
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.OTPConfirmed
    , Data  : ''
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
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

let reg_register = 
{
    Type      : Type.Rest
  , Describe  : 'User Register Register'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/user/register'
    , Body   : 
    {
        Task     : task.Register
      , MobileNo : user.MobileNo
      , Name     : user.Name
      , Email    : user.Email
      , Password : user.Password
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.Registered
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
    let req = 
    {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp  = await Rest(req)
      , token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header["Authorization"] = 'Bearer ' + token
    return data
  }
}

let login = 
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
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
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

let passwd_genotp = 
{
    Type      : Type.Rest
  , Describe  : 'User Password Generate_OTP'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/user/passwd/reset'
    , Body   : 
    {
        MobileNo : user.MobileNo
      , Password : user.Password
      , Task     : task.GenOTP
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.OTPSendVia.format((user.MobileNo)? 'SMS': 'MAIL')
    , Data  : {}
  }
}

let passwd_confirmotp = 
{
    Type      : Type.Rest
  , Describe  : 'User Password Confirm_OTP'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/user/passwd/reset'
    , Body   : 
    {
        Task     : task.ConfirmOTP
      , MobileNo : user.MobileNo
      , OTP      : ''
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.OTPConfirmed
    , Data  : ''
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
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

let passwd_setpassword = 
{
    Type      : Type.Rest
  , Describe  : 'User Password Set_Password'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/user/passwd/reset'
    , Body   : 
    {
        Task     : task.SetPassword
      , Password : user.Password + '1'
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.PasswdUpdated
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header["Authorization"] = 'Bearer ' + token
    return data
  }
}

let passwd_setpassword_revert                       = {...passwd_setpassword}
    passwd_setpassword_revert.Request.Body.Password = user.Password

let profile = 
{
    Type      : Type.Rest
  , Describe  : 'User Profile'
  , Request   :
  {
      Method : Method.GET
    , Path   : '/user/profile'
    , Body   : {}
    , Header : {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : ''
    , Data  : 
    {
        Name      : user.Name
      , MobileNo  : user.MobileNo
      , Email     : user.Email
      , Mode      : user.Mode
    }
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header["Authorization"] = 'Bearer ' + token
    return data
  }
}

let profile_edit = 
{
    Type      : Type.Rest
  , Describe  : 'User Profile Edit'
  , Request   :
  {
      Method : Method.PUT
    , Path   : '/user/profile'
    , Body   : 
    {
        Password    : user.Password
      , NewPassword : user.Password
      , Name        : user.Name
      , Email       : user.Email
    }
    , Header : {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.ProfileUpdated
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('  : Read Test Params')
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header["Authorization"] = 'Bearer ' + token
    return data
  }
}

module.exports = 
[
  reg_new,
  reg_readotp,
  reg_register,

  login,
  
  passwd_genotp,
  passwd_confirmotp,      // Edit password
  passwd_setpassword,
  passwd_genotp,
  passwd_confirmotp,      // Revert it, for the sake of rest of TC
  passwd_setpassword_revert,

  profile,
  profile_edit
]