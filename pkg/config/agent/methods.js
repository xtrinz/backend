const otp   = require('../../infra/otp')
    , jwt   = require('../../infra/jwt')
    , Model = require('../../system/models')
    , Tool  = require('../../tools/export')[Model.resource.agent]    
    , db    = require('../exports')[Model.segment.db]
    , Agent = require('./model')
    , Log   = require('../../system/log')

const Context	= async function(data, resp)
{
    Log('create-conext', { Data: data })
    let agent_

    if(data.Task == Model.task.EditProfile)
        agent_ = await db.agent.Get(data.Agent._id,  Model.query.ByID)
    else if(data.Task == Model.task.Approve)
        agent_ = await db.agent.Get(data.AgentID,  Model.query.ByID)
    else
        agent_ = await db.agent.Get(data.MobileNo, Model.query.ByMobileNo) 
     

    if (!agent_)
    {
        Log('agent-not-found-setting-new-context', 
        { MobileNo: data.MobileNo })

        agent_ = new Agent({ MobileNo: data.MobileNo })
    }

    let ctxt =
    {
          Agent  : agent_
        , Data   : data
        , Return : resp
    }
    Log('agent-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Agent.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Agent.Otp   = hash
    ctxt.Agent.State = Model.states.New

    await db.agent.Save(ctxt.Agent)

    Log('agent-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    Log('agent-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Agent.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Agent.Otp = hash
    await db.agent.Save(ctxt.Agent)

    Log('agent-login-otp-sent', { Context: ctxt })
    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Agent.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Agent._id, Mode : Model.mode.Agent })

    ctxt.Agent.State = Model.states.MobConfirmed
    ctxt.Agent.Otp   = ''
    await db.agent.Save(ctxt.Agent)
    Log('agent-mobile-number-confirmed', { Agent: ctxt.Agent })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
       Command   : Model.command.Register
    }
    return data_
}

const Token     = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Agent.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    Log('agent-exists-logging-in', { Agent: ctxt.Agent })

    const token = await jwt.Sign({ _id : ctxt.Agent._id, Mode : Model.mode.Agent })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Agent.Name
      , MobileNo  : ctxt.Agent.MobileNo
      , Email     : ctxt.Agent.Email      
      , Mode      : Model.mode.Agent
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    ctxt.Agent.Name     = ctxt.Data.Name
    ctxt.Agent.Email    = ctxt.Data.Email
    ctxt.Agent.Location =
    {
          type        : 'Point'
        , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }    
    ctxt.Agent.State    = Model.states.ToBeApproved

    await db.agent.Save(ctxt.Agent)

    Log('agent-registered', 
    {  Agent  : ctxt.Agent })

    let data_ = await View(ctxt.Agent)
    data_.Command = Model.command.LoggedIn

    return data_    
}

const Approve  = async function (ctxt)
{
    Log('agent-approve', { Context: ctxt })

    if(ctxt.Data.Action == Model.task.Deny)
    {
        ctxt.Agent.State  = Model.states.ToBeCorrected
        ctxt.Agent.Text   = ctxt.Data.Text
    }
    else
    {
        ctxt.Agent.State  = Model.states.Registered
        ctxt.Agent.Text   = ''
    }

    await db.agent.Save(ctxt.Agent)

    Log('admin-response-marked', { Agent: ctxt.Agent })
    return {}
}

const Edit      = async function (ctxt)
{

    let rcd = { _id : ctxt.Agent._id }

    if(ctxt.Data.Name  ) rcd.Name = ctxt.Data.Name 

    if(ctxt.Data.Refeed && (ctxt.Agent.State != Model.states.Registered))
        rcd.State = Model.states.ToBeApproved

    if(ctxt.Data.Name  ) rcd.Name  = ctxt.Data.Name 
    if(ctxt.Data.Email ) rcd.Email = ctxt.Data.Email
    if(ctxt.Data.Status)
    {
        let now_ = new Date()
          , date =
        {
              Day    : now_.getDate()
            , Month  : now_.getMonth()
            , Year   : now_.getFullYear()
        }

        rcd.Status = 
        {
            Current : ctxt.Data.Status
            , SetOn : date
        }
    }

    if(ctxt.Data.Longitude && ctxt.Data.Latitude)
    rcd.Location =
    {
        type        : 'Point'
      , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }

    await db.agent.Save(rcd)
    Log('profile-updated', {Context: ctxt})
}

const List      = async function(in_)
{
    Log('list-agents', { In : in_ })

    let proj = { projection:  Tool.project[Model.verb.view][Model.mode.Admin] }

    Tool.filter[Model.verb.list](in_)

    let data = await db.agent.List(in_, proj)
    
    Tool.rinse[Model.verb.list](data)
        
    Log('agent-list', { Agents : data })
    return data
}

const View      = async function(in_)
{
    Log('view-agent', { In : in_ })

    Tool.rinse[Model.verb.view](in_)
    const data = 
    {
        Name      : in_.Name
      , MobileNo  : in_.MobileNo
      , Email     : in_.Email
      , Mode      : in_.Mode
      , Status    : in_.Status
    }

    Log('agent-data', { Agent : data })
    return data
}    

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Edit,
    Approve,    Context,    List,
    View
}