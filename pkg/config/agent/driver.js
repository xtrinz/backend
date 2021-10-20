const { states, query, message, gw,
        Err_, code, reason, mode, command}          = require('../../system/models')
    , otp                            = require('../../infra/otp')
    , jwt                            = require('../../infra/jwt')
    , { ObjectID }                   = require('mongodb')
    , { Cart }                       = require('../cart/driver')
    , db                             = require('../agent/archive')

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
      , CartID        : ''
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
        let agent = await db.Get(this.Data.MobileNo, query.ByMobileNo)
        if (agent && agent.State === states.Registered)
        {
            const otp_sms = new otp.OneTimePasswd({
                            MobileNo: 	agent.MobileNo, 
                            Body: 	message.OnAuth })
                , hash    = await otp_sms.Send(gw.SMS)

            agent.Otp = hash
            await db.Save(agent)
            return
        }

        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)

        if(!agent) { this.Data._id = new ObjectID() }
        else { this.Data._id = agent._id }

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
            Err_(code.BAD_REQUEST, reason.OtpRejected)
        }

        const token = await jwt.Sign({ _id : this.Data._id, Mode : this.Data.Mode })

        if (this.Data.State === states.Registered)
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

        const cart       = new Cart(data.Agent._id)
        data.Agent.CartID = await cart.Create()
        data.Agent.Name   = data.Name
        data.Agent.Email  = data.Email        
        data.Agent.State  = states.Registered

        await db.Save(data.Agent)
        console.log('agent-registered', 
        {  AgentID  : data.Agent._id 
         , Name    : data.Name       
         , Email   : data.Email    })
    }

    this.Edit   = async function (data)
    {
        if ( data.Agent.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.IncompleteRegistration)

        let rcd = { _id : data.Agent._id }
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