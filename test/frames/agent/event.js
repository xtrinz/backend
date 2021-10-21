const { task, code, status, text, command, qtype } = require('../../../pkg/system/models')
    , { Method, Type }             = require('../../lib/medium')
    , { read }                     = require('../../lib/driver')
    , data                         = require('../data')
    , jwt                          = require('../../../pkg/infra/jwt')

let RegisterNew = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Agent Register New'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/agent/register'
          , Body       : 
          {
              Task     : task.New
            , MobileNo : agent.MobileNo
            , Mode     : agent.Mode       
          }
          , Header     : {}
        }
        , Skip         : []
        , Response     :
        {
            Code       : code.OK
          , Status     : status.Success
          , Text       : text.OTPSendToMobileNo.format(
                          agent.MobileNo.substr(
                          agent.MobileNo.length - 4))
          , Data       : {}
        }
      }
      return templ
    }

    this.PostSet        = async function(res_)
    {
      let resp  = await read()
        , agent  = data.Get(data.Obj.Agent, this.ID)
      agent.OTP  = resp.Data.OTP
      data.Set(data.Obj.Agent, this.ID, agent)
    }
}

let RegisterReadOTP = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.ID)
      let templ =
      {
          Type         : Type.Rest
        , Describe     : 'Agent Register Read_OTP'
        , Request      :
        {
            Method     : Method.POST
          , Path       : '/v1/agent/register'
          , Body       : 
          {
              Task     : task.ReadOTP
            , MobileNo : agent.MobileNo
            , OTP      : agent.OTP
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
    let agent   = data.Get(data.Obj.Agent, this.ID)
      , data_   = await jwt.Verify(res_.Data.Token)
    agent.ID    = data_._id
    agent.Token = res_.Data.Token
    data.Set(data.Obj.Agent, this.ID, agent)
  }
}

let Register = function(name) 
{
    this.ID     = name
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.ID)
      let templ =      
      {
          Type            : Type.Rest
        , Describe        : 'Agent Register Register'
        , Request         :
        {
            Method        : Method.POST
          , Path          : '/v1/agent/register'
          , Body          : 
          {
              Task        : task.Register
            , MobileNo    : agent.MobileNo
            , Name        : agent.Name
            , Email       : agent.Email
            , Longitude   : agent.Longitude
            , Latitude    : agent.Latitude            
          }
          , Header        :
          {
            Authorization : agent.Token
          }
        }
        , Response        :
        {
            Code          : code.OK
          , Status        : status.Success
          , Text          : text.Registered
          , Data          :
          {
              Name        : agent.Name
            , MobileNo    : agent.MobileNo
            , Email       : agent.Email
            , Mode        : agent.Mode
            , Command     : command.LoggedIn
          }
        }
      }
      return templ
    }
}

let RegisterApprove =  function(agent_, admin_) 
{
  this.AdminID  = admin_
  this.AgentID  = agent_
  this.Data     = function()
  {
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let admin = data.Get(data.Obj.User, this.AdminID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Agent Register Approve'
      , Request         :
      {
          Method        : Method.POST
        , Path          : '/v1/agent/register'
        , Body          : 
        {
            Task        : task.Approve
          , AgentID     : agent.ID
          , Action      : task.Approve
        //, Action      : task.Deny
        //, Text        : "Please correct ASDF Field"
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
        , Text          : text.Approved
        , Data          : {}
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
      let agent  = data.Get(data.Obj.Agent, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Agent Socket Connect'
        , Method        : Method.CONNECT
        , Authorization : {'auth' : {Token : agent.Token }}
        , Socket        : {}
        , Skip          : []
        , Event         : {}
      }
      return templ
    }
    this.PostSet        = async function(res_)
    {
      if(this.ID.startsWith('Agent1')) { await read() }
      let agent    = data.Get(data.Obj.Agent, this.ID)
      agent.Socket = res_.Socket
      agent.Channel= res_.Channel
      data.Set(data.Obj.Agent, this.ID, agent)
    }
}

let ProfileGet = function(name) 
{
  this.ID     = name
  this.Data   = function()
  {
    let agent  = data.Get(data.Obj.Agent, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Agent Profile'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/agent/view'
        , Body          : {}
        , Header        :
        {
          Authorization : agent.Token
        }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          : 
        {
            Name        : agent.Name
          , MobileNo    : agent.MobileNo
          , Email       : agent.Email
          , Mode        : agent.Mode
          , Status      : agent.Status
        }
      }
    }
    return templ
  }
}

let List = function(agent_, admin_) 
{
  this.AdminID   = admin_
  this.AgentID  = agent_
  this.Data     = function()
  {
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let admin = data.Get(data.Obj.User, this.AdminID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Agent List'
      , Request         :
      {
          Method        : Method.GET
        , Path          : '/v1/agent/list'
        , Query         :
        {
            Longitude   : '17.20000'
          , Latitude    : '17.20000'
          , Page        : 1
          , Limit       : 8
          , SearchType  : qtype.NearList
        }
        , Body          : { }
        , Header        : { Authorization : admin.Token }
      }
      , Response        :
      {
          Code          : code.OK
        , Status        : status.Success
        , Text          : ''
        , Data          :
          [{
              AgentID     : agent.ID
            , Name        : agent.Name
            , MobileNo    : agent.MobileNo
            , Email       : agent.Email
            , Text        : ''            
            , Latitude    : agent.Latitude
            , Longitude   : agent.Longitude
            , Status      : agent.Status
            , State       : agent.State
          }]
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
    let agent  = data.Get(data.Obj.Agent, this.ID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Agent Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/agent/profile'
        , Body          : 
        {                   
            Name        : agent.Name
          , Email       : agent.Email
          , Longitude   : agent.Longitude
          , Latitude    : agent.Latitude   
          , Status      : 'OnDuty'         // TODO    
        }                   
        , Header        :
        {                   
          Authorization : agent.Token
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
      let agent  = data.Get(data.Obj.Agent, this.ID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Agent Socket Disconnect'
        , Method        : Method.DISCONNECT
        , Authorization : {}
        , Socket        : agent.Socket
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
    , RegisterApprove
    , Connect
    , ProfileGet
    , List
    , ProfileEdit
    , Disconnect
}