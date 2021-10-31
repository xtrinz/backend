const { Err_ }      = require('../../system/models')
    , Model         = require('../../system/models')
    , Tool          = require('../../tools/export')[Model.resource.agent]
    , Infra         = require('../../infra/export')
    , { ObjectID }  = require('mongodb')
    , db            = require('../exports')[Model.segment.db][Model.resource.agent]
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
        this.State         = Model.states.None
        this.Status        = 
        {
              Current      : Model.states.OffDuty
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
        let agent_ = await db.Get(this.MobileNo, Model.query.ByMobileNo)
        if (agent_ && ( agent_.State === Model.states.Registered   ||
                        agent_.State === Model.states.ToBeApproved ))
        {
            const otp_sms = new Infra.otp.OneTimePasswd({
                            MobileNo: agent_.MobileNo, 
                            Body: 	  Model.message.OnAuth })
                , hash    = await otp_sms.Send(Model.gw.SMS)

            agent_.Otp = hash
            await db.Save(agent_)
            return
        }
        const otp_sms = new Infra.otp.OneTimePasswd({
                        MobileNo: 	this.MobileNo, 
                        Body: 	Model.message.OnAuth })
            , hash    = await otp_sms.Send(Model.gw.SMS)

        if(!agent_) { this._id = new ObjectID() }
        else { this._id = agent_._id }

        this.Otp             = hash
        this.State           = Model.states.New
        await db.Save(this)
        console.log('agent-created', { Agent: this})
    }

    static async Confirm(data)
    {
        let agent_ = await db.Get(data.MobileNo, Model.query.ByMobileNo)
        if (!agent_)
        {
            console.log('agent-not-found', { Input: data })
            Err_(Model.code.BAD_REQUEST, Model.reason.AgentNotFound)
        }

        const otp_   = new Infra.otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(agent_.Otp, data.OTP)
        if (!status) 
        {
            console.log('wrong-otp-on-confirm-agent', { Data: data })
            Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
        }

        const token = await Infra.jwt.Sign({ _id : agent_._id, Mode : Model.mode.Agent })
        let ret_ =
        {
            Token   : token
          , Command : ''
          , Agent   : agent_
        }

        if (agent_.State === Model.states.Registered    ||
            agent_.State === Model.states.ToBeApproved  ||
            agent_.State === Model.states.ToBeCorrected )
        {
            ret_.Command = Model.command.LoggedIn
            console.log('agent-exists', { Agent: agent_ })
        }
        else
        {
            agent_.State = Model.states.MobConfirmed
            agent_.Otp   = ''
            ret_.Command = Model.command.Register
            await db.Save(agent_)
            console.log('agent-confirmed', { Agent: agent_ })
        }

        return ret_
    }

    static async Register(data)
    {

        if (data.Agent.State !== Model.states.MobConfirmed)
        {
            console.log('bad-state-for-register', { Agent : data.Agent })
            Err_(Model.code.BAD_REQUEST, Model.reason.MobileNoNotConfirmed)
        }

        data.Agent.Name     = data.Name
        data.Agent.Email    = data.Email        
        data.Agent.Location =
        {
              type        : 'Point'
            , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }
        data.Agent.State    = Model.states.ToBeApproved

        await db.Save(data.Agent)
        console.log('set-agent-for-approval', { Agent : data.Agent})
    }

    static async Approve(data)
    {
        console.log('agent-approval', { Agent: data })
    
        let agent_ = await db.Get(data.AgentID, Model.query.ByID)
        if (!agent_ || agent_.State !== Model.states.ToBeApproved)
        {
            let reason_
            if(agent_) reason_ = Model.reason.BadState
            else       reason_ = Model.reason.StoreNotFound
            Err_(Model.code.BAD_REQUEST, reason_)
        }

        if(data.Action == Model.task.Deny)
        {
            agent_.State  = Model.states.ToBeCorrected
            agent_.Text   = data.Text
        }
        else
        {
            agent_.State  = Model.states.Registered
            agent_.Text   = ''
        }
    
        await db.Save(agent_)
        console.log('agent-admin-response-marked', { Agent: agent_ })
    }

    static async Edit(data)
    {
        let rcd = { _id : data.Agent._id }

        if(data.Refeed && (data.Agent.State != Model.states.Registered))
            rcd.State       = Model.states.ToBeApproved

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

        let proj = { projection:  Tool.project[Model.verb.view][Model.mode.Admin] }

        Tool.filter[Model.verb.list](in_)

        let data = await db.List(in_, proj)
        
        Tool.rinse[Model.verb.list](data)
            
        console.log('agent-list', { Agents : data })
        return data
    }    

    static async View(in_)
    {
        console.log('view-agent', { In : in_ })

        Tool.rinse[Model.verb.view](in_)
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