const { states, query, message, task,
        gw, Err_, code, reason, 
        mode, command}          = require('../../system/models')
    , otp                       = require('../../infra/otp')
    , jwt                       = require('../../infra/jwt')
    , { ObjectID }              = require('mongodb')
    , db                        = require('../agent/archive')

function Agent(data)
{
    if(data)
    this.Data =
    {
        MobileNo      : data.MobileNo
      , Mode          : data.Mode
      , _id           : ''
      , Otp           : ''
      , State         : states.None
      , Name          : ''
      , Email         : ''
      , SockID        : []
      , AddressList   : []
      , Location      :
      {
          type        : 'Point'
        , coordinates : [0, 88] // [data.Longitude.loc(), data.Latitude.loc()]
      }
      , IsLive        : false
    }

    this.New      = async function ()
    {
        let agent_ = await db.Get(this.Data.MobileNo, query.ByMobileNo)
        if (agent_ && ( agent_.State === states.Registered   ||
                        agent_.State === states.ToBeApproved ))
        {
            const otp_sms = new otp.OneTimePasswd({
                            MobileNo: agent_.MobileNo, 
                            Body: 	  message.OnAuth })
                , hash    = await otp_sms.Send(gw.SMS)

            agent_.Otp = hash
            await db.Save(agent_)
            return
        }
        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)

        if(!agent_) { this.Data._id = new ObjectID() }
        else { this.Data._id = agent_._id }

        this.Data.Otp             = hash
        this.Data.State           = states.New
        await db.Save(this.Data)
        console.log('agent-created', { Agent: this.Data})
    }

    this.ConfirmMobileNo   = async function (data)
    {
        this.Data = await db.Get(data.MobileNo, query.ByMobileNo)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.AgentNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) 
        {
            console.log('wrong-otp-on-agent-no-confirmation', { Data: data })
            Err_(code.BAD_REQUEST, reason.OtpRejected)
        }

        const token = await jwt.Sign({ _id : this.Data._id, Mode : mode.Agent })

        if (this.Data.State === states.Registered    ||
            this.Data.State === states.ToBeApproved  ||
            this.Data.State === states.ToBeCorrected )
        {
            console.log('agent-exists-logging-in', { Agent: this.Data })            
            return {
                  Token: token
                , Command: command.LoggedIn
            }
        }
        this.Data.State = states.MobConfirmed
        this.Data.Otp   = ''
        await db.Save(this.Data)
        console.log('agent-mobile-number-confirmed', { Agent: this.Data })

        return {
            Token: token
          , Command: command.Register
        }
    }

    this.Register   = async function (data)
    {
        if (data.Agent.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, reason.MobileNoNotConfirmed)

        data.Agent.Name     = data.Name
        data.Agent.Email    = data.Email        
        data.Agent.Location =
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }
        data.Agent.State  = states.ToBeApproved


        await db.Save(data.Agent)
        console.log('agent-scheduled-for-approval', 
        {  AgentID  : data.Agent._id 
         , Name    : data.Name       
         , Email   : data.Email    })
    }

    this.Approve   = async function (data)
    {
        console.log('agent-approval', { Agent: data })

        this.Data = await db.Get(data.AgentID, query.ByID)
        if (!this.Data || this.Data.State !== states.ToBeApproved)
        {
                      let reason_ = reason.StoreNotFound
            if(this.Data) reason_ = reason.BadState
            Err_(code.BAD_REQUEST, reason_)
        }

        if(data.Action == task.Deny)
        {
            this.Data.State  = states.ToBeCorrected
            this.Data.Text   = data.Text
        }
        else
        {
            this.Data.State  = states.Registered
            this.Data.Text   = ''
        }

        await db.Save(this.Data)
        console.log('agent-admin-response-marked', {Store: this.Data})
    }

    this.Edit   = async function (data)
    {
        if ( data.Agent.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.IncompleteRegistration)

        let rcd = { _id : data.Agent._id }

        if(data.Refeed && (data.Store.State != states.Registered))
            rcd.State       = states.ToBeApproved

        if(data.Name ) rcd.Name  = data.Name 
        if(data.Email) rcd.Email = data.Email
        if(data.Longitude && data.Latitude)
        rcd.Location =
        {
            type        : 'Point'
          , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }

        await db.Save(rcd)
        console.log('profile-updated', {Agent: this.Data})
    }

}

module.exports =
{
    Agent : Agent
}