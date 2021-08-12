const { Method, Type }       = require('../../lib/medium')
    , data                   = require('../data')
    , { read }               = require('../../lib/driver')
    , { code, status, text } = require('../../../pkg/common/error')
    , { task }               = require('../../../pkg/common/models')

let RegisterNew = function(user_, store_) 
{
    this.UserID   = user_
    this.StoreID  = store_
    this.Data     = function()
    {
      let store  = data.Get(data.Obj.Store, this.StoreID)
      let user   = data.Get(data.Obj.User, this.UserID)      
      let templ =
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
            , Header            : { Authorization : 'Bearer ' + user.Token }
        }
        , Skip                  : [ 'StoreID' ]
        , Response              :
        {
              Code              : code.OK
            , Status            : status.Success
            , Text              : text.OTPSendToMobileNo.format(
                                    store.MobileNo.substr(
                                    store.MobileNo.length - 4))
            , Data              : { StoreID: '' }
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , store = data.Get(data.Obj.Store, this.StoreID)
      store.OTP = resp.Data.OTP
      store.ID  = res_.Data.StoreID
      data.Set(data.Obj.Store, this.StoreID, store)
    }
}

let RegisterReadOTP = function(user_, store_) 
{
  this.UserID   = user_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store = data.Get(data.Obj.Store, this.StoreID)
    let user  = data.Get(data.Obj.User , this.UserID )      
    let templ =
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
            , OTP      : store.OTP
          }
          , Header     : { Authorization: 'Bearer ' + user.Token }
        }
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPConfirmed
          , Data       : {}
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
    let admin = data.Get(data.Obj.User, this.AdminID)
    let templ =
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
          , StoreID     : store.ID
        }
        , Header        :
        {
          Authorization : 'Bearer ' + admin.Token
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
        , Path          : '/store/view'
        , Body          : {}
        , Query         : 
        {
          StoreID       : store.ID
        }
        , Header        :
        {
          Authorization : 'Bearer ' + user.Token
        }
      }
      , Response         :
      {
          Code           : code.OK
        , Status         : status.Success
        , Text           : ''
        , Data           :
        {
            StoreID      : store.ID
          , Name         : store.Name
          , State        : store.State
          , Image        : store.Image
          , Type         : store.Type
          , Certs        : store.Certs
          , MobileNo     : store.MobileNo
          , Email        : store.Email
          , Longitude    : store.Longitude
          , Latitude     : store.Latitude
          , Address      :
          {
              Line1      : store.Address.Line1
            , Line2      : store.Address.Line2
            , City       : store.Address.City
            , PostalCode : store.Address.PostalCode
            , State      : store.Address.State
            , Country    : store.Address.Country
          }
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
        , Path          : '/store/list'
        , Body          : {}
        , Header        : { Authorization : 'Bearer ' + user.Token }
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
                StoreID : store.ID
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
    return templ
  }
}

let AddStaffRequest = function(owner_, staff_, store_) 
{
  this.OwnerID  = owner_
  this.StoreID  = store_
  this.StaffID  = staff_
  this.Data     = function()
  {
    let store  = data.Get(data.Obj.Store, this.StoreID)
    let owner  = data.Get(data.Obj.User, this.OwnerID)
    let staff  = data.Get(data.Obj.User, this.StaffID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Staff Request'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/store/staff'
        , Body          : 
        {
            Task        : task.Request
          , StoreID     : store.ID
          , MobileNo    : staff.MobileNo
        }
        , Header        : { Authorization : 'Bearer ' + owner.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.WaitingForStaffReply
        , Data          : {}
      }
    }
    return templ
  }
}

let AddStaffAccept = function(staff_, store_) 
{
  this.StaffID  = staff_
  this.StoreID  = store_
  this.Data     = function()
  {
    let store  = data.Get(data.Obj.Store, this.StoreID)
    let staff  = data.Get(data.Obj.User, this.StaffID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Staff Accept'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/store/staff'
        , Body          :
        {
            Task        : task.Accept
          , StoreID     : store.ID
        }
        , Header        : { Authorization : 'Bearer ' + staff.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.ResponseUpdated
        , Data          : {}
      }
    }
    return templ
  }
}

let AddStaffRevoke = function(owner_, staff_, store_) 
{
  this.OwnerID  = owner_
  this.StoreID  = store_
  this.StaffID  = staff_
  this.Data     = function()
  {
    let store  = data.Get(data.Obj.Store, this.StoreID)
    let owner  = data.Get(data.Obj.User, this.OwnerID)
    let staff  = data.Get(data.Obj.User, this.StaffID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Staff Revoke'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/store/staff'
        , Body          :
        {
            Task        : task.Revoke
          , MobileNo    : staff.MobileNo
          , StoreID     : store.ID
        }
        , Header        : { Authorization : 'Bearer ' + owner.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.Revoked
        , Data          : {}
      }
    }
    return templ
  }
}

let AddStaffRelieve = function(owner_, staff_, store_) 
{
  this.OwnerID  = owner_
  this.StoreID  = store_
  this.StaffID  = staff_
  this.Data     = function()
  {
    let store  = data.Get(data.Obj.Store, this.StoreID)
    let owner  = data.Get(data.Obj.User, this.OwnerID)
    let staff  = data.Get(data.Obj.User, this.StaffID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Staff Relieve'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/store/staff'
        , Body          :
        {
          Task          : task.Relieve
        , MobileNo      : staff.MobileNo
        , StoreID       : store.ID
        }
        , Header        : { Authorization : 'Bearer ' + owner.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : text.Relieved
        , Data          : {}
      }
    }
    return templ
  }
}

let ListStaff = function(owner_, staff_, store_) 
{
  this.OwnerID  = owner_
  this.StoreID  = store_
  this.StaffID  = staff_
  this.Data     = function()
  {
    let store  = data.Get(data.Obj.Store, this.StoreID)
    let owner  = data.Get(data.Obj.User, this.OwnerID)
    let staff  = data.Get(data.Obj.User, this.StaffID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Store Staff List'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/store/staff'
        , Body          : {}
        , Query         : 
        {
          StoreID       : store.ID
        }
        , Header        : { Authorization : 'Bearer ' + owner.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          :
        {
            Approved :
            [{
                Name    : staff.Name
              , MobileNo: staff.MobileNo
            }]
          , Pending  : []
        }
      }
    }
    return templ
  }
}

module.exports =
{
      RegisterNew     , RegisterReadOTP , RegisterApprove                              // Store registration sequence
    , Read            , List                                                           // Read store
    , AddStaffRequest , AddStaffAccept  , AddStaffRevoke  , AddStaffRelieve, ListStaff // Staff Management
}