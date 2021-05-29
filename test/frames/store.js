const { Method, Type, Rest }  = require("../lib/medium")
    , { task, mode }          = require("../../pkg/common/models")
    , { code, status, text }  = require("../../pkg/common/error")
    , jwt                     = require("../../pkg/common/jwt")

let store =
{
      Name         : 'StoreName'
    , Image        : 'image.store.com'
    , Type         : 'Electorics'
    , Certs        : ['im.good.cert', 'we.good.cert']
    , MobileNo     : '+91111111111'
    , Email        : 'store@store.com'
    , Longitude    : 17.21
    , Latitude 	   : 17.21
    , Address      :
    {
          Line1       : 'Address.Line1'
        , Line2       : 'Address.Line2'
        , City        : 'Address.City'
        , PostalCode  : 000000
        , State       : 'Address.State'
        , Country     : 'Address.Country'
    }
}

let reg_new = 
{
      Type           : Type.Rest
    , Describe       : 'Store Register New'
    , Request        :
    {
          Method     : Method.POST
        , Path       : '/store/register'
        , Body       : 
        {
            Task     : task.New
          , ...store
        }
        , Header     : {}
    }
    , Response       :
    {
          Code       : code.OK
        , Status     : status.Success
        , Text       : text.OTPSendToMobNo.format(
                        store.MobileNo.substr(
                        store.MobileNo.length - 4))
        , Data       : {}
    }
    , PreSet         : async function(data)
    {
      console.log('    : Read Test Params')
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

let reg_readotp = 
{
    Type      : Type.Rest
  , Describe  : 'Store Register Read_OTP'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/store/register'
    , Body   : 
    {
        Task     : task.ReadOTP
      , MobileNo : store.MobileNo
      , OTP      : ''
    }
    , Header: {}
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.OTPConfirmed
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('    : Read Test Params')
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.OTP = resp.Data.OTP
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header["Authorization"] = 'Bearer ' + token
    return data
  }
}

let reg_approve = 
{
    Type      : Type.Rest
  , Describe  : 'Store Register Approve'
  , Request   :
  {
      Method : Method.POST
    , Path   : '/store/register'
    , Body   : 
    {
        Task     : task.Approve
      , StoreID  : ''
    }
    , Header:
    {
    	Authorization: ''
    }
  }
  , Response  :
  {
      Code  : code.OK
    , Status: status.Success
    , Text  : text.Approved
    , Data  : {}
  }
  , PreSet         : async function(data)
  {
    console.log('    : Read Test Params')
    let req = {
        Method     : Method.GET
      , Path       : '/test'
      , Body       : {}
      , Header     : {}
    }
    let resp = await Rest(req)
    data.Request.Body.StoreID = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

module.exports = 
[
	  reg_new
    , reg_readotp
    , reg_approve
]