const { users }               = require("../common/database")
    , { states, mode, query } = require("../common/models")
    , { Err_, code, reason}   = require('../common/error')
    , test                    = require('../common/test')
    , otp                     = require('../common/otp')
    , jwt                     = require("../common/jwt")
    , { ObjectID, ObjectId }  = require("mongodb")
    , { Cart }                = require("./cart")
    , bcrypt                  = require("bcryptjs")

function User(mob_no, user_mode)
{
    this.Data =
    {
        MobNo      : mob_no
      , Mode       : user_mode              // User/ Agent / Admin / Owner
      , _id        : ''
      , Otp        : ''
      , State      : states.None
      , Name       : ''
      , Passwd     : ''
      , Email      : ''
      , CartID     : ''
      , AddressList: []
      , StoreList  : 
      {
            Owned     : []    // Created By User
          , Accepted  : []    // Managed By User
          , Pending   : []    // Invitation Received for management
      }  
      , ResetPasswd: false
      , IsLive     : false
    }
    this.Save       = async function()
    {
        console.log('save-user', this.Data)
        const resp  = await users.updateOne({ _id : this.Data._id },
                            { $set : this.Data }, { upsert : true })
        if (!resp.result.ok)
        {
            console.log('user-save-failed', { Data: this.Data, Result: resp.result})
            Err_(code.INTERNAL_SERVER, 0, reason.DBAdditionFailed)
        }
        console.log('user-saved', this.Data)
    }

    this.Get = async function(param, qType)
    {
        console.log('find-user', { Param: param, QType: qType})
        let query_
        switch (qType)
        {
            case query.ByID    : query_ = { _id: ObjectId(param) } ; break;
            case query.ByMobNo : query_ = { MobNo: param }         ; break;
            case query.ByMail  : query_ = { Email: param }         ; break;
        }
        let user = await users.findOne(query_)
        if (!user)
        {
          console.log('user-not-found', query_)
          return
        }
        this.Data = user
        console.log('user-found', { User: user })
        return user
    }

    this.ListNearbyLiveAgents = async function(Loc)
    {
        console.log('list-nearby-live-agents', {Location: Loc})
        const lon     = parseFloat(Loc[0])
        const lat     = parseFloat(Loc[1])
        /*  1) Filter UserID, UserName & SocketID 
            2) No of Agents : <= 10 [Limit]
            3) Nearest free / near-to-free agents
            4) Live
            5) Within 5km radius
            6) User Type: Agent                */
        const agentLimit    = 10
            , maxDist       = 5000
            , geometry      = { $geometry: { type: "Point", coordinates: [lon, lat] }, $maxDistance: maxDist }
            , projections   = { _id: 1, Name: 1, SockID: 1 }
            , query         = { location: { $near: geometry }, IsLive : true, Mode: mode.Agent }
        const agents = await users.find(query, projections).limit(agentLimit).toArray()
        if (!agents.length)
        {
            console.log(`no-agents-found. _id: ${Loc}`)
            return
        }
        console.log(`agents-found. agents: ${agents}`)
        return agents
    }

    this.Auth   = async function (token)
    {
        if (!token) Err_(code.BAD_REQUEST, 0, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = await jwt.Verify(token)

        const user = await this.Get(res._id, query.ByID)
        if (!user)
        {
            console.log('user-not-found', {UserID: res._id})
            Err_(code.BAD_REQUEST, 0, reason.UserNotFound)
        }
        console.log('user-authenticated', {User: this.Data})
    }

    this.New      = async function ()
    {
        let user = await this.Get(this.Data.MobNo, query.ByMobNo)
        if (user && user.State === states.Registred)
        Err_(code.BAD_REQUEST, 0, reason.UserFound)

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.Data.MobNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash    = await otp_sms.Send(otp.Opts.SMS)

        if(!user) { this.Data._id = new ObjectID() }
        this.Data.Otp             = hash
        this.Data.State           = states.New
        await this.Save()
        test.Set('UserID', this.Data._id) // #101
        console.log('user-created', { User: this.Data})
    }

    this.ConfirmMobNo   = async function (data)
    {
        let user     = await this.Get(data.MobileNo, query.ByMobNo)
        if (!user || user.State === states.Registred)
           Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobNo: "", Body: ""})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, 0, reason.OtpRejected)

        this.Data.State = states.MobConfirmed
        this.Data.Otp   = ''
        await this.Save()
        console.log('user-mobile-number-confirmed', { User: this.Data})
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.Register   = async function (data)
    {
        if (this.Data.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, 0, reason.MobNoNotConfirmed)

        const cart       = new Cart(this.Data._id)
        this.Data.CartID = await cart.Create()
        this.Data.Name   = data.Name
        this.Data.Passwd = await bcrypt.hash(data.Password, 5) // salt = 5hash_pwd
        this.Data.Email  = data.Email        
        this.Data.State  = states.Registered

        await this.Save()
        console.log('user-registered', 
            {
                  UserID  : this.Data._id
                , Name    : data.Name
                , Email   : data.Email
            })
    }

    this.Login   = async function (data)
    {

        let param, qType
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobNo }
        else               { param = data.Email;    qType = query.ByMail  }

        let user = user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        let status = await bcrypt.compare(user.Passwd, data.Password)
        if (!status) Err_(code.BAD_REQUEST, 0, reason.IncorrectCredentials)
        
        this.Data.ResetPasswd = false
        await this.Save()

        console.log('user-loggedin', {Name: user.Name, UserID: user._id})        
        const token = await jwt.Sign({ _id: user._id })
        return token
    }

    this.SetPwdResetFlag   = async function (data)
    {

        let param, qType, via
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobNo; via = otp.Opts.SMS }
        else               { param = data.Email;    qType = query.ByMail;  via = otp.Opts.MAIL }

        let user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        const otp_  = new otp.OneTimePasswd({
                        MobNo:  user.MobNo,
                        Email:  user.Email,
                        Body:   otp.Msgs.ResetPass })
        const hash  = await otp_.Send(via) 
        
        this.Data.Otp         = hash
        this.Data.ResetPasswd = true
        await this.Save()

        console.log('user-password-flag-set', { User: data})
        return via
    }

    this.ConfirmOTPOnPasswdReset   = async function (data)
    {
        let param, qType
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobNo }
        else               { param = data.Email;    qType = query.ByMail  }

        let user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobNo: this.Data.MobNo, Body: ""})
            , status = await otp_.Confirm(this.Data.Otp, Otp)

        if (!this.ResetPasswd || !status)
        Err_(code.BAD_REQUEST, 0, reason.OtpRejected)

        await this.Save()

        console.log('otp-confirmed-on-password-reset', {User: this.Data})
        const token = await jwt.Sign({ _id: this._id })
        return token
    }

    this.UpdatePasswd   = async function (passwd)
    {
        if ( this.Data.State !== states.Registered ||
            !this.Data.ResetPasswd)
        {
            let reason_ = reason.IncompleteRegistration
            if(!this.Data.ResetPasswd) { reason_ = reason.PasswdResetNotPermited }
            Err_(code.BAD_REQUEST, 0, reason_)
        }
        this.Data.Passwd = await bcrypt.hash(passwd, 5) // salt =5
        await this.Save()
        console.log('password-updated', {User: this.Data})
    }

}

module.exports =
{
    User : User
}