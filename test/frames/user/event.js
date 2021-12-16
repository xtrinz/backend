const Model            = require('../../../pkg/system/models')
    , { Method, Type } = require('../../lib/medium')
    , { read }         = require('../../lib/driver')
    , data             = require('../data')
    , jwt              = require('../../../pkg/infra/jwt')

let RegisterNew = function(user) 
{
    this.UserID     = user
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.UserID)
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
              Task     : Model.task.New
            , MobileNo : user.MobileNo
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
        , user  = data.Get(data.Obj.User, this.UserID)
      user.OTP  = resp.Data.OTP
      data.Set(data.Obj.User, this.UserID, user)
    }
}

let RegisterReadOTP = function(user, journal) 
{
    this.UserID     = user
    this.JournalID  = journal
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.UserID)
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
              Task     : Model.task.ReadOTP
            , MobileNo : user.MobileNo
            , OTP      : user.OTP
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

    let user   = data.Get(data.Obj.User,   this.UserID)
      , data_   = await jwt.Verify(res_.Data.Token)
    user.ID    = data_._id
    user.Token = res_.Data.Token
    data.Set(data.Obj.User, this.UserID, user)

    journal.Buyer.ID = user.ID

    data.Set(data.Obj.Journal, this.JournalID, journal)
  }
}

let Register = function(user) 
{
    this.UserID     = user
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.UserID)
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
              Task        : Model.task.Register
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
            Code          : Model.code.OK
          , Status        : Model.status.Success
          , Text          : Model.text.Registered
          , Data          :
          {
              Name        : user.Name
            , MobileNo    : user.MobileNo
            , Email       : user.Email
            , Mode        : user.Mode
            , Command     : Model.command.LoggedIn
          }
        }
      }
      return templ
    }
}

let Connect = function(user) 
{
    this.UserID     = user
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.UserID)
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
      if(this.UserID.startsWith('Agent1')) { await read() }
      let user    = data.Get(data.Obj.User, this.UserID)
      user.Socket = res_.Socket
      user.Channel= res_.Channel
      data.Set(data.Obj.User, this.UserID, user)
    }
}

let ProfileGet = function(user) 
{
  this.UserID     = user
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'User Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/user/view'
        , Body          : {}
        , Header        :
        {
          Authorization : user.Token
        }
      }
      , Response        :
      {
          Code          : Model.code.OK
        , Status        : Model.status.Success
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

let ProfileEdit =  function(user) 
{
  this.UserID     = user
  this.Data   = function()
  {
    let user  = data.Get(data.Obj.User, this.UserID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'User Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/user/edit'
        , Body          : 
        {                   
            Name        : user.Name
          , Email       : user.Email
          , Longitude   : user.Longitude
          , Latitude    : user.Latitude               
        }                   
        , Header        :
        {                   
          Authorization : user.Token
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

let Dsc = function(user) 
{
    this.UserID     = user
    this.Data   = function()
    {
      let user  = data.Get(data.Obj.User, this.UserID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'User Socket Dsc'
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
      RegisterNew   , RegisterReadOTP  , Register
    , Connect       , ProfileGet       , ProfileEdit
    , Dsc
}