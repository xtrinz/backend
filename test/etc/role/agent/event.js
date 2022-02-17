const { task, code, status
      , text, command, qtype } = require('../../../../pkg/sys/models')
    , { Method, Type }         = require('../../../lib/medium')
    , { read }                 = require('../../../lib/driver')
    , data                     = require('../../data')
    , jwt                      = require('../../../../pkg/infra/jwt')

let RegisterNew = function(agent) 
{
    this.AgentID     = agent
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
        , agent  = data.Get(data.Obj.Agent, this.AgentID)
      agent.OTP  = resp.Data.OTP
      data.Set(data.Obj.Agent, this.AgentID, agent)
    }
}

let RegisterReadOTP = function(agent, journal) 
{
    this.AgentID     = agent
    this.JournalID   = journal
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
    let agent   = data.Get(data.Obj.Agent,   this.AgentID)
      , data_   = await jwt.Verify(res_.Data.Token)
    agent.ID    = data_._id
    agent.Token = res_.Data.Token
    data.Set(data.Obj.Agent, this.AgentID, agent)

    if(this.JournalID)
    {
      let journal = data.Get(data.Obj.Journal, this.JournalID)    
      journal.Agent.ID = agent.ID
      data.Set(data.Obj.Journal, this.JournalID, journal)
    }
  }
}

let Register = function(agent) 
{
    this.AgentID     = agent
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
            , Status      : 'OffDuty'            
            , Command     : command.LoggedIn
          }
        }
      }
      return templ
    }
}

let RegisterApprove =  function(agent_, arbiter_) 
{
  this.ArbiterID  = arbiter_
  this.AgentID  = agent_
  this.Data     = function()
  {
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let arbiter = data.Get(data.Obj.Arbiter, this.ArbiterID)
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
          Authorization : arbiter.Token
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


let Connect = function(agent) 
{
    this.AgentID     = agent
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
      if(this.AgentID.startsWith('Agent1')) { await read() }
      let agent    = data.Get(data.Obj.Agent, this.AgentID)
      agent.Socket = res_.Socket
      agent.Channel= res_.Channel
      data.Set(data.Obj.Agent, this.AgentID, agent)
    }
}

let ProfileGet = function(agent) 
{
  this.AgentID     = agent
  this.Data   = function()
  {
    let agent  = data.Get(data.Obj.Agent, this.AgentID)
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
          , State       : agent.State
          , Text        : ''
        }
      }
    }
    return templ
  }
}

let List = function(agent_, arbiter_) 
{
  this.ArbiterID   = arbiter_
  this.AgentID  = agent_
  this.Data     = function()
  {
    let agent = data.Get(data.Obj.Agent, this.AgentID)
    let arbiter = data.Get(data.Obj.Arbiter, this.ArbiterID)
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
        , Header        : { Authorization : arbiter.Token }
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
            , Status      : agent.Status
            , State       : agent.State
          }]
      }
    }
    return templ
  }
}

let ProfileEdit =  function(agent) 
{
  this.AgentID     = agent
  this.Data   = function()
  {
    let agent  = data.Get(data.Obj.Agent, this.AgentID)
    let templ =
    {
        Type            : Type.Rest
      , Describe        : 'Agent Profile Edit'
      , Request         :
      {                   
          Method        : Method.PUT
        , Path          : '/v1/agent/edit'
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

let Dsc = function(agent) 
{
    this.AgentID     = agent
    this.Data   = function()
    {
      let agent  = data.Get(data.Obj.Agent, this.AgentID)
      let templ =      
      {
          Type          : Type.Event
        , Describe      : 'Agent Socket Dsc'
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
    , Dsc
}