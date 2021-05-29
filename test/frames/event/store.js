const { Method, Type, Rest }  = require("../../lib/medium")
    , { prints }              = require("../../lib/driver")
    , jwt                     = require("../../../pkg/common/jwt")
    , { code, status, text }  = require("../../../pkg/common/error")
    , { task }                = require("../../../pkg/common/models")

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

let Read = function(store)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store View'
    , Request         :
    {
        Method        : Method.GET
      , Path          : '/store/view'
      , Body          : {}
      , Query         : 
      {
        StoreID       : ''
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
      , Text          : ''
      , Data          :
      {
            StoreID         : ''
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
    data.Request.Query.StoreID = resp.Data.StoreID
    data.Response.Data.StoreID = resp.Data.StoreID    
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let List = function(store)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store List'
    , Request         :
    {
        Method        : Method.GET
      , Path          : '/store/list'
      , Body          : {}
      , Header        : { Authorization : '' }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : ''
      , Data          :
      {
        Owned :
          [{
              StoreID : ''
            , Name    : store.Name
            , Image   : store.Image
            , Type    : store.Type
            , State   : store.State
          }]
        , Accepted : []
        , Pending  : []
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
    data.Response.Data.Owned[0].StoreID = resp.Data.StoreID    
    let token = await jwt.Sign({ _id: resp.Data.UserID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let AddStaffRequest = function(user)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store Add-Staff Request'
    , Request         :
    {
        Method        : Method.POST
      , Path          : '/store/staff'
      , Body          : 
      {
          Task        : task.Request
        , StoreID     : ''
        , MobileNo    : user.MobileNo
      }
      , Header        : { Authorization : '' }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : text.WaitingForStaffReply
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
    let token = await jwt.Sign({ _id: resp.Data.AdminID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let AddStaffAccept = function(user)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store Add-Staff Accept'
    , Request         :
    {
        Method        : Method.POST
      , Path          : '/store/staff'
      , Body          :
      { 
          Task    : task.Accept
        , StoreID : ''
      }
      , Header        : { Authorization : '' }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : text.ResponseUpdated
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

let AddStaffRevoke = function(user)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store Add-Staff Revoke'
    , Request         :
    {
        Method        : Method.POST
      , Path          : '/store/staff'
      , Body          :
      {
          Task    : task.Revoke
        , StaffID : ''
        , StoreID : ''
      }
      , Header        : { Authorization : '' }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : text.Revoked
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
    data.Request.Body.StaffID = resp.Data.UserID
    data.Request.Body.StoreID = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.AdminID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

let AddStaffRelieve = function(user)
{
  this.Data =
  {
      Type            : Type.Rest
    , Describe        : 'Store Add-Staff Relieve'
    , Request         :
    {
        Method        : Method.POST
      , Path          : '/store/staff'
      , Body          :
      {
          Task    : task.Relieve
        , StaffID : ''
        , StoreID : ''
      }
      , Header        : { Authorization : '' }
    }
    , Response        :
    {
        Code          : code.OK
      , Status        : status.Success
      , Text          : text.Relieved
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
    data.Request.Body.StaffID = resp.Data.UserID
    data.Request.Body.StoreID = resp.Data.StoreID
    let token = await jwt.Sign({ _id: resp.Data.AdminID })
    data.Request.Header.Authorization = 'Bearer ' + token
    return data
  }
}

module.exports =
{
      RegisterNew     , RegisterReadOTP , RegisterApprove                   // Store registration sequence
    , Read            , List                                                // Read store
    , AddStaffRequest , AddStaffAccept  , AddStaffRevoke  , AddStaffRelieve // Staff Management
}