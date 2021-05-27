const { Method, Type, Rest }  = require("../lib/medium")
    , { task, mode }          = require("../../pkg/common/models")
    , { code, status, text }  = require("../../pkg/common/error")
    , jwt                     = require("../../pkg/common/jwt")

const user =
{
  MobileNo : '+915660844848'

}

const reg_new = 
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
    , PreSet         : async function(data)
    {
      return data
    }
}

const reg_readotp = 
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

// How to enable few lines of code if test env var is set

module.exports = [reg_new, reg_readotp]