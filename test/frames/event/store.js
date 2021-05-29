const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , { task }                = require("../../../pkg/common/models")
    , { code, status, text }  = require("../../../pkg/common/error")
    , jwt                     = require("../../../pkg/common/jwt")

let RegisterNew = function(store)
{
  this.Data =
  {
      Type                  : Type.Rest
    , Describe              : 'Store Register New'
    , Request               :
    {
          Method            : Method.POST
        , Path              : '/store/register'
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
        , Text              : text.OTPSendToMobNo.format(
                                store.MobileNo.substr(
                                store.MobileNo.length - 4))
        , Data              : {}
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

let RegisterReadOTP = function(store)
{
  this.Data =
  {
        Type         : Type.Rest
      , Describe     : 'Store Register Read_OTP'
      , Request      :
      {
          Method     : Method.POST
        , Path       : '/store/register'
        , Body       : 
        {
            Task     : task.ReadOTP
          , MobileNo : store.MobileNo
          , OTP      : ''
        }
        , Header     : { Authorization: '' }
      }
      , Response     :
      {
          Code       : code.OK
        , Status     : status.Success
        , Text       : text.OTPConfirmed
        , Data       : {}
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
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let RegisterApprove = function(store)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store Register Approve'
    , Request         :
    {
        Method        : Method.POST
      , Path          : '/store/register'
      , Body          : 
      {
          Task        : task.Approve
        , StoreID     : ''
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
      , Text          : text.Approved
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
    data.Request.Body.StoreID = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

module.exports =
{
      RegisterNew   , RegisterReadOTP,  RegisterApprove  // Store registration sequence
    , 
}