const { states, query, message, task,
        gw, Err_, code, reason,
        mode, command, verb}    = require('../../system/models')
    , otp                       = require('../../infra/otp')
    , jwt                       = require('../../infra/jwt')
    , { ObjectID }              = require('mongodb')
    , db                        = require('../agent/archive')
    , filter                    = require('../../tools/filter/agent')
    , project                   = require('../../tools/project/agent')
    , rinse                     = require('../../tools/rinse/agent')

class Agent
{
    constructor (data)
    {

        let date_ = new Date(0)
        let date  =
        {              
            Day      : date_.getDate()
          , Month    : date_.getMonth()
          , Year     : date_.getFullYear()
        }

        this._id           = new ObjectID()
        this.MobileNo      = data.MobileNo
        this.Mode          = data.Mode
        this.Otp           = ''
        this.State         = states.None
        this.Status        = 
        {
              Current      : states.OffDuty
            , SetOn        : date
        }
        this.Name          = ''
        this.Email         = ''
        this.Text          = ''
        this.SockID        = []
        this.Location      =
        {
            type           : 'Point'
          , coordinates    : [0, 88]
        }
        this.IsLive        = false

    }

    async Create()
    {
        let agent_ = await db.Get(this.MobileNo, query.ByMobileNo)
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
                        MobileNo: 	this.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)

        if(!agent_) { this._id = new ObjectID() }
        else { this._id = agent_._id }

        this.Otp             = hash
        this.State           = states.New
        await db.Save(this)
        console.log('agent-created', { Agent: this})
    }

    static async Confirm(data)
    {
        let agent_ = await db.Get(data.MobileNo, query.ByMobileNo)
        if (!agent_)
        {
            console.log('agent-not-found', { Input: data })
            Err_(code.BAD_REQUEST, reason.AgentNotFound)
        }

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(agent_.Otp, data.OTP)
        if (!status) 
        {
            console.log('wrong-otp-on-confirm-agent', { Data: data })
            Err_(code.BAD_REQUEST, reason.OtpRejected)
        }

        const token = await jwt.Sign({ _id : agent_._id, Mode : mode.Agent })
        let ret_ =
        {
            Token   : token
          , Command : ''
          , Agent   : agent_
        }

        if (agent_.State === states.Registered    ||
            agent_.State === states.ToBeApproved  ||
            agent_.State === states.ToBeCorrected )
        {
            ret_.Command = command.LoggedIn
            console.log('agent-exists', { Agent: agent_ })
        }
        else
        {
            agent_.State = states.MobConfirmed
            agent_.Otp   = ''
            ret_.Command = command.Register
            await db.Save(agent_)
            console.log('agent-confirmed', { Agent: agent_ })
        }

        return ret_
    }

    static async Register(data)
    {

        if (data.Agent.State !== states.MobConfirmed)
        {
            console.log('bad-state-for-register', { Agent : data.Agent })
            Err_(code.BAD_REQUEST, reason.MobileNoNotConfirmed)
        }

        data.Agent.Name     = data.Name
        data.Agent.Email    = data.Email        
        data.Agent.Location =
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }
        data.Agent.State    = states.ToBeApproved

        await db.Save(data.Agent)
        console.log('set-agent-for-approval', { Agent : data.Agent})
    }

    static async Approve(data)
    {
        console.log('agent-approval', { Agent: data })
    
        let agent_ = await db.Get(data.AgentID, query.ByID)
        if (!agent_ || agent_.State !== states.ToBeApproved)
        {
            let reason_
            if(agent_) reason_ = reason.BadState
            else       reason_ = reason.StoreNotFound
            Err_(code.BAD_REQUEST, reason_)
        }

        if(data.Action == task.Deny)
        {
            agent_.State  = states.ToBeCorrected
            agent_.Text   = data.Text
        }
        else
        {
            agent_.State  = states.Registered
            agent_.Text   = ''
        }
    
        await db.Save(agent_)
        console.log('agent-admin-response-marked', { Agent: agent_ })
    }

    static async Edit(data)
    {
        let rcd = { _id : data.Agent._id }

        if(data.Refeed && (data.Agent.State != states.Registered))
            rcd.State       = states.ToBeApproved

        if(data.Name ) rcd.Name  = data.Name 
        if(data.Email) rcd.Email = data.Email
        if(data.Longitude && data.Latitude)
        rcd.Location =
        {
            type        : 'Point'
          , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }
        if(data.Status)
        {
            let now_   = new Date()
              , date   =
            {
                Day    : now_.getDate()
              , Month  : now_.getMonth()
              , Year   : now_.getFullYear()
            }
            rcd.Status = 
            {
                  Current : data.Status
                , SetOn   : date
            }
        }

        await db.Save(rcd)
        console.log('profile-updated', {Agent: rcd })
    }

    static async List(in_)
    {
        console.log('list-agents', { In : in_ })

        let proj = { projection:  project[verb.view][mode.Admin] }

        filter[verb.list](in_)

        let data = await db.List(in_, proj)
        
        rinse[verb.list](data)
            
        console.log('agent-list', { Agents : data })
        return data
    }    

    static async View(in_)
    {
        console.log('view-agent', { In : in_ })

        rinse[verb.view](in_)
        const data = 
        {
            Name      : in_.Name
          , MobileNo  : in_.MobileNo
          , Email     : in_.Email
          , Mode      : in_.Mode
          , Status    : in_.Status
        }

        console.log('agent-data', { Agent : data })
        return data
    }    

}

module.exports =
{
    Agent : Agent
}