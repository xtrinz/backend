const { users }              = require("../common/database")
    , { states, mode }       = require("../common/models")
    , { Err_, code, reason}  = require('../common/error')
    , otp                    = require('../common/otp')
    , jwt                    = require("../common/jwt")
    , { ObjectID, ObjectId } = require("mongodb")
    , { Cart }               = require("./cart")

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
    this.Set        = (user) => this.Data = user

    this.Save       = async function()
    {
        console.log('save-user', this.Data)
        const resp  = await users.updateOne({ _id : this.Data._id },
                        { $set : this.Data }, { upsert : true })

        if (resp.upsertedCount !== 1)
        {
            console.log('user-save-failed', this.Data)
            Err_(code.INTERNAL_SERVER, 0, reason.DBAdditionFailed)
        }
        console.log('user-saved', this.Data)
    }
    
    this.GetByID = async function(_id)
    {
        console.log(`find-user-by-id. ID: ${_id}`)
        const query = { _id: ObjectId(_id) }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log('user-not-found-by-id', { _id: _id})
          return
        }
        this.Set(user)
        console.log('user-found-by-id', { User: user })
        return user
    }

    this.GetByMobNo = async function(mob_no)
    {
        console.log('find-user-by-mob-no',{ MobileNo: mob_no})
        const query = { MobNo: mob_no }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log('user-not-found-by-mob-no', { MobileNo: mob_no})
          return
        }
        this.Set(user)
        console.log('user-found-by-mob-no', { User: user })
        return user
    }

    this.GetByEmail = async function(email)
    {
        console.log(`find-user-by-email. Email: ${email}`)
        const query = { Email: email }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log('user-not-found-by-email', { Email: email})
          return
        }
        this.Set(user)
        console.log('user-found-by-email', { User: user })
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
        const agentLimit      = 10
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

    this.ComparePasswd = async function (hash, passwd)
    {
      const result = await bcrypt.compare(passwd, hash)
      return result
    }

    this.Auth   = async function (token)
    {
        if (!token) Err_(code.BAD_REQUEST, 0, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = await jwt.Verify(token)

        const user = await this.GetByID(res._id)
        if (!user)
        {
            console.log('user-not-found', {UserID: res._id})
            Err_(code.BAD_REQUEST, 0, reason.UserNotFound)
        }
        console.log('user-authenticated', {User: this.Data})
    }

    this.New      = async function ()
    {
        let user = await this.GetByMobNo(this.Data.MobNo)
        if (user && user.State === states.Registred)
        Err_(code.BAD_REQUEST, 0, reason.UserFound)

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.Data.MobNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash    = await otp_sms.Send(otp.Opts.SMS)

        this.Data._id        = new ObjectID()
        this.Data.Otp        = hash
        this.Data.State      = states.New
        await this.Save()
        console.log('user-created', { User: this.Data})
    }

    this.ConfirmMobNo   = async function (data)
    {
        let user     = await this.GetByMobNo(data.MobNo)
        if (!user)   Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobNo: "", Body: ""})
            , status = await otp_.Confirm(this.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, 0, reason.OtpRejected)

        this.Data.State = states.MobConfirmed
        await this.Save()
        console.log(`user-mobile-number-confirmed. user: ${this}`)
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.Register   = async function (data)
    {
        if (user.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, 0, reason.MobNoNotConfirmed)

        const salt      = 5
        const hash_pwd  = await bcrypt.hash(data.Password, salt)

        this.Data.Name       = data.Name
        this.Data.Passwd     = hash_pwd
        this.Data.Email      = data.Email
        
        const cart       = new Cart(this.Data._id)
        this.Data.CartID = cart.Create()
        this.Data.State  = states.Registered
        await this.Save()
        console.log('user-registered', {User: this.Data})
    }

    this.Login   = async function (data)
    {
        let user
        if (data.MobNo) { user = await this.GetByMobNo(data.MobNo) }
        else            { user = await this.GetByEmail(data.Email) }

        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        let status = await this.ComparePasswd(user.Passwd, data.Password)
        if (!status) Err_(code.BAD_REQUEST, 0, reason.IncorrectCredentials)
        
        this.Data.ResetPasswd = false
        await this.Save()

        console.log('user-loggedin', {Name: user.Name, UserID: user._id})        
        const token = await jwt.Sign({ _id: user._id })
        return token
    }

    this.SetPwdResetFlag   = async function (data)
    {
        let user, via
        if (data.MobNo) 
        { 
            user    = await this.GetByMobNo(data.MobNo)
            via     = otp.Opts.SMS
        }
        else
        { 
            user    = await this.GetByEmail(data.Email)
            via     = otp.Opts.MAIL
        }

        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, 0, reason.UserNotFound)

        const otp_  = new otp.OneTimePasswd({
                        MobNo:  user.MobNo,
                        Email:  user.Email,
                        Body:   otp.Msgs.ResetPass })
        const hash = await otp_.Send(via) 
        
        this.Data.Otp         = hash
        this.Data.ResetPasswd = true
        await this.Save()

        console.log(`set-user-password-flag. user: ${data}`)
        return via
    }

    this.ConfirmOTPOnPasswdReset   = async function (data)
    {
        let user
        if (data.MobNo) { user = await this.GetByMobNo(data.MobNo) }
        else            { user = await this.GetByEmail(data.Email) }

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
        if (this.Data.State !== states.Registered || !this.Data.ResetPasswd)
        {
            let reason_ = reason.IncompleteRegistration
            if(!this.Data.ResetPasswd) { reason_ = reason.PasswdResetNotPermited }
            Err_(code.BAD_REQUEST, 0, reason_)
        }

        const salt       = 5
        const hash_pwd   = await bcrypt.hash(passwd, salt)
        this.Data.Passwd = hash_pwd
        await this.Save()

        console.log('password-updated', {User: this.Data})
    }

}

module.exports =
{
    User : User
}