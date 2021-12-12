const { task, code, status
      , text, command, qtype } = require('../../../pkg/system/models')
    , { Method, Type }         = require('../../lib/medium')
    , { read }                 = require('../../lib/driver')
    , data                     = require('../data')
    , jwt                      = require('../../../pkg/infra/jwt')

let RegisterNew = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let admin  = data.Get(data.Obj.Admin, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Admin Register New'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/admin/register'
          , Body       : 
          {
              Task     : task.New
            , MobileNo : admin.MobileNo
            , Mode     : admin.Mode       
          }
          , Header     : {}
        }
        , Skip         : []
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPGenerated
          , Data       : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , admin  = data.Get(data.Obj.Admin, this.ID)
      admin.OTP  = resp.Data.OTP
      data.Set(data.Obj.Admin, this.ID, admin)
    }
}

let RegisterReadOTP = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let admin  = data.Get(data.Obj.Admin, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Admin Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/admin/register'
          , Body       : 
          {
              Task     : task.ReadOTP
            , MobileNo : admin.MobileNo
            , OTP      : admin.OTP
          }
          , Header     : {}
        }
        , Skip         : [ 'Token' ]
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPConfirmed
          , Data       : { Token: '', Command: command.Register }
        }
      }
      return templ
  }
  this.PostSet        = async function(res_)
  {
    let admin   = data.Get(data.Obj.Admin, this.ID)
      , data_   = await jwt.Verify(res_.Data.Token)
    admin.ID    = data_._id
    admin.Token = res_.Data.Token
    data.Set(data.Obj.Admin, this.ID, admin)
  }
}

let Register = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let admin  = data.Get(data.Obj.Admin, this.ID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Admin Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/admin/register'
          , Body          : 
          {
              Task        : task.Register
            , MobileNo    : admin.MobileNo
            , Name        : admin.Name
            , Longitude   : admin.Longitude
            , Latitude    : admin.Latitude            
          }
          , Header        :
          {
            Authorization : admin.Token
          }
        }
        , Response        :
        {
            Code          : code.OK
          , Status        : status.Success
          , Text          : text.Registered
          , Data          :
          {
              Name        : admin.Name
            , MobileNo    : admin.MobileNo
            , Mode        : admin.Mode
            , Command     : command.LoggedIn
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
      let admin  = data.Get(data.Obj.Admin, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Admin Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : admin.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ID.startsWith('Agent1')) { await read() }
      let admin    = data.Get(data.Obj.Admin, this.ID)
      admin.Socket = res_.Socket
      admin.Channel= res_.Channel
      data.Set(data.Obj.Admin, this.ID, admin)
    }
}

let ProfileGet = function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let admin  = data.Get(data.Obj.Admin, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Admin Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/admin/view'
        , Body          : {}
        , Header        :
        {
          Authorization : admin.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          : 
        {
            Name        : admin.Name
          , MobileNo    : admin.MobileNo
          , Mode        : admin.Mode
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
    let admin  = data.Get(data.Obj.Admin, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Admin Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/admin/edit'
        , Body          : 
        {                   
            Name        : admin.Name
          , Longitude   : admin.Longitude
          , Latitude    : admin.Latitude   
        }                   
        , Header        :
        {                   
          Authorization : admin.Token
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
      let admin  = data.Get(data.Obj.Admin, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Admin Socket Disconnect'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : admin.Socket
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