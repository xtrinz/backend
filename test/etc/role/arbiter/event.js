const { task, code, status
      , text, command, qtype } = require('../../../../pkg/sys/models')
    , { Method, Type }         = require('../../../lib/medium')
    , { read }                 = require('../../../lib/driver')
    , data                     = require('../../data')
    , jwt                      = require('../../../../pkg/infra/jwt')

let RegisterNew  = function(arbiter) 
{
    this.ArbiterID = arbiter
    this.Data    = function()
    {
      let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Arbiter Register New'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/arbiter/register'
          , Body       : 
          {
              Task     : task.New
            , MobileNo : arbiter.MobileNo
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
        , arbiter = data.Get(data.Obj.Arbiter, this.ArbiterID)
      arbiter.OTP = resp.Data.OTP
      data.Set(data.Obj.Arbiter, this.ArbiterID, arbiter)
    }
}

let RegisterReadOTP = function(arbiter, journal) 
{
    this.ArbiterID   = arbiter
    this.JournalID = journal
    this.Data      = function()
    {
      let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Arbiter Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/arbiter/register'
          , Body       : 
          {
              Task     : task.ReadOTP
            , MobileNo : arbiter.MobileNo
            , OTP      : arbiter.OTP
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
    let journal = data.Get(data.Obj.Journal, this.JournalID)

    let arbiter   = data.Get(data.Obj.Arbiter,   this.ArbiterID)
      , data_   = await jwt.Verify(res_.Data.Token)
    arbiter.ID    = data_._id
    arbiter.Token = res_.Data.Token
    data.Set(data.Obj.Arbiter, this.ArbiterID, arbiter)

    journal.Arbiter.ID = arbiter.ID

    data.Set(data.Obj.Journal, this.JournalID, journal)
  }
}

let Register = function(arbiter) 
{
    this.ArbiterID     = arbiter
    this.Data   = function()
    {
      let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Arbiter Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/arbiter/register'
          , Body          : 
          {
              Task        : task.Register
            , MobileNo    : arbiter.MobileNo
            , Name        : arbiter.Name
            , Longitude   : arbiter.Longitude
            , Latitude    : arbiter.Latitude            
          }
          , Header        :
          {
            Authorization : arbiter.Token
          }
        }
        , Response        :
        {
            Code          : code.OK
          , Status        : status.Success
          , Text          : text.Registered
          , Data          :
          {
              Name        : arbiter.Name
            , MobileNo    : arbiter.MobileNo
            , Mode        : arbiter.Mode
            , Command     : command.LoggedIn
          }
        }
      }
      return templ
    }
}

let Connect = function(arbiter) 
{
    this.ArbiterID     = arbiter
    this.Data   = function()
    {
      let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Arbiter Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : arbiter.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ArbiterID.startsWith('Agent1')) { await read() }
      let arbiter    = data.Get(data.Obj.Arbiter, this.ArbiterID)
      arbiter.Socket = res_.Socket
      arbiter.Channel= res_.Channel
      data.Set(data.Obj.Arbiter, this.ArbiterID, arbiter)
    }
}

let ProfileGet = function(arbiter) 
{
  this.ArbiterID     = arbiter
  this.Data   = function()
  {
    let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Arbiter Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/arbiter/view'
        , Body          : {}
        , Header        :
        {
          Authorization : arbiter.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          : 
        {
            Name        : arbiter.Name
          , MobileNo    : arbiter.MobileNo
          , Mode        : arbiter.Mode
        }
      }
    }
    return templ
  }
}

let ProfileEdit =  function(arbiter) 
{
  this.ArbiterID     = arbiter
  this.Data   = function()
  {
    let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Arbiter Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/arbiter/edit'
        , Body          : 
        {                   
            Name        : arbiter.Name
          , Longitude   : arbiter.Longitude
          , Latitude    : arbiter.Latitude   
        }                   
        , Header        :
        {                   
          Authorization : arbiter.Token
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

let Dsc = function(arbiter) 
{
    this.ArbiterID     = arbiter
    this.Data   = function()
    {
      let arbiter  = data.Get(data.Obj.Arbiter, this.ArbiterID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Arbiter Socket Dsc'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : arbiter.Socket
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
    , Dsc
}