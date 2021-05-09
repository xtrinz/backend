const { users }                     = require("./connect")
const { ObjectID, ObjectId }        = require("mongodb")
const { states, mode }              = require("../common/models")
const { Err, code, status, reason}  = require('../common/error')
const { Cart }                      = require("./cart")
const otp                           = require('../common/otp')
const jwt                           = require("jsonwebtoken")
const jwt_secret                    = process.env.JWT_AUTHORIZATION_TOKEN_SECRET

function User(mob_no, user_mode)
{
    this.MobNo      = mob_no
    this.Mode       = user_mode              // User/ Agent / Admin / Owner

    this._id        = ''
    this.Otp        = ''
    this.State      = states.None

    this.Name       = ''
    this.Passwd     = ''
    this.Email      = ''

    this.CartID     = ''
    this.AddressList= []

    this.StoreList  = 
    {
          Owned     : []    // Created By User
        , Accepted  : []    // Managed By User
        , Pending   : []    // Invitation Received for management
    }

    this.ResetPasswd= false
    this.IsLive     = false

    this.Set        = function(user)
    {
        this.MobNo      = user.MobNo
        this.Mode       = user.Mode

        this._id        = user._id
        this.Otp        = user.Otp
        this.State      = user.State

        this.Name       = user.Name
        this.Passwd     = user.Passwd
        this.Email      = user.Email

        this.CartID     = user.CartID
        this.AddressList= user.AddressList
        this.StoreList  = user.StoreList

        this.ResetPasswd= user.ResetPasswd
        this.IsLive     = user.IsLive
    }

    this.Save       = async function()
    {
        console.log('save-user', this)
        const resp  = await users.updateOne({ _id 	 : this._id },
                                            { $set   : this	    },
                                            { upsert : true     })
        if (resp.modifiedCount !== 1) 
        {
            console.log('save-user-failed', this)
            throw new Err(code.INTERNAL_SERVER,
                          status.Failed,
                          reason.DBAdditionFailed)
        }
    }
    
    this.GetByID = async function(_id)
    {
        console.log(`find-user-by-id. ID: ${_id}`)
        const query = { _id: ObjectId(_id) }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log(`user-not-found. MobNo: ${email}`)
          return
        }
        this.Set(user)
        console.log(`user-found. user: ${user}`)
        return user
    }

    this.GetByMobNo = async function(mob_no)
    {
        console.log(`find-user-by-mob-no. MobNo: ${mob_no}`)
        const query = { MobNo: mob_no }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log(`user-not-found. MobNo: ${mob_no}`)
          return
        }
        this.Set(user)
        console.log(`user-found. user: ${user}`)
        return user
    }

    this.GetByEmail = async function(email)
    {
        console.log(`find-user-by-email. Email: ${email}`)
        const query = { Email: email }
        let user = await users.findOne(query)
        if (!user)
        {
          console.log(`user-not-found. MobNo: ${email}`)
          return
        }
        console.log(`user-found. user: ${user}`)
        return user
    }

    this.ListNearbyLiveAgents = async function(Loc)
    {
        console.log(`list-nearby-live-agents. Co-ordintes: ${Loc}`)
        const lon     = parseFloat(Loc[0])
        const lat     = parseFloat(Loc[1])
        /* 1) Filter UserID, UserName & SocketID 
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
        const agents = await users.find(query, projections)
                                    .limit(agentLimit)
                                    .toArray()
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
      if(!result)
      {
        console.log('wrong-passwd')
      } else
      {
        console.log('passwd-confirmed')
      }
      return result
    }

    this.Auth   = async function (token)
    {
        if (!token)
        {
            console.log('token-missing')
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.TokenMissing
            throw new Err(code_, status_, reason_)
        }
        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = jwt.verify(token, jwt_secret)

        const user = await this.GetByID(res._id)
        if (!user)
        {
            console.log('user-not-found', res._id)
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.UserNotFound
            throw new Err(code_, status_, reason_)
        }
        console.log(`user-authenticated. user: ${this}`)
    }

    this.New      = async function ()
    {
        let user = await this.GetByMobNo(this.MobNo)
        if (!user || user.State === states.Registred)
        {
            throw new Err(code.BAD_REQUEST,
                          status.Failed,
                          reason.UserFound)
        }

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.MobNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash = otp_sms.Send(otp.Opts.SMS)

        this._id        = new ObjectID()
        this.Otp        = hash
        this.State      = states.New
        this.Save()
        console.log(`new-user-created. user: ${this}`)
    }

    this.ConfirmMobNo   = async function (data)
    {
        let user = await this.GetByMobNo(data.MobNo)
        if (!user)
        {
            throw new Err(code.BAD_REQUEST,
                          status.Failed,
                          reason.UserNotFound)
        }
        this.Set(user)
        const otp_ = new otp.OneTimePasswd({MobNo: "", Body: ""})
        if (!otp_.Confirm(this.Otp, data.OTP))
        {
            throw new Err(code.BAD_REQUEST,
                        status.Failed,
                        reason.OtpRejected)
        }
        this.State      = states.MobConfirmed
        this.Save()
        console.log(`user-mobile-number-confirmed. user: ${this}`)

        const token = jwt.sign({ _id: this._id }, jwt_secret)
        return token
    }

    this.Register   = async function (data)
    {
        if (user.State !== states.MobConfirmed)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.MobNoNotConfirmed
            throw new Err(code_, status_, reason_)
        }

        const salt      = 5
        const hash_pwd  = await bcrypt.hash(data.Password, salt)

        this.Name       = data.Name
        this.Passwd     = hash_pwd
        this.Email      = data.Email
        
        if (this.Mode == mode.Agent)
        {
            // Create Cart for user
            const cart  = new Cart(this._id)
            this.CartID = cart.Create()
        }

        this.State      = states.Registered
        this.Save()
        console.log(`user-registered. user: ${this}`)
    }

    this.Login   = async function (data)
    {
        let user
        if (data.MobNo) { user = await this.GetByMobNo(data.MobNo) }
        else            { user = await this.GetByEmail(data.Email) }

        if (!user || user.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.UserNotFound
            throw new Err(code_, status_, reason_)
        }

        if (!this.ComparePasswd(user.Passwd, data.Password))
        {
            throw new Err(code.BAD_REQUEST,
                          status.Failed,
                          reason.IncorrectCredentials)
        }
        
        this.Set(user)
        this.ResetPasswd = false
        this.Save()

        console.log(`user-loggedin. _id: ${user.Name} user: ${user._id}`)        
        const token = jwt.sign({ _id: user._id }, jwt_secret)
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
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.UserNotFound
            throw new Err(code_, status_, reason_)
        }
        const otp_  = new otp.OneTimePasswd({
                        MobNo:  user.MobNo,
                        Email:  user.Email,
                        Body:   otp.Msgs.ResetPass })
        const hash = otp_.Send(via) 
        
        this.Set(user)
        this.Otp         = hash
        this.ResetPasswd = true
        this.Save()

        console.log(`set-user-password-flag. user: ${data}`)
        return via
    }

    this.ConfirmOTPOnPasswdReset   = async function (data)
    {
        let user
        if (data.MobNo) { user = await this.GetByMobNo(data.MobNo) }
        else            { user = await this.GetByEmail(data.Email) }

        if (!user || user.State !== states.Registered)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
                  , reason_     = reason.UserNotFound
            throw new Err(code_, status_, reason_)
        }

        this.Set(user)
        const otp_ = new otp.OneTimePasswd({MobNo: this.MobNo, Body: ""})
        if (!this.ResetPasswd || !otp_.Confirm(this.Otp, Otp))
        {
            throw new Err(code.BAD_REQUEST,
                        status.Failed,
                        reason.OtpRejected)
        }
        this.Save()
        
        console.log(`otp-confirmed-on-password-reset. user: ${this}`)
        const token = jwt.sign({ _id: this._id }, jwt_secret)
        return token
    }

    this.UpdatePasswd   = async function (passwd)
    {
        if (this.State !== states.Registered || !this.ResetPasswd)
        {
            const   code_       = code.BAD_REQUEST
                  , status_     = status.Failed
            let     reason_     = reason.IncompleteRegistration
            if(!this.ResetPasswd) { reason_ = reason.PasswdResetNotPermited}
            throw new Err(code_, status_, reason_)
        }

        const salt      = 5
        const hash_pwd  = await bcrypt.hash(passwd, salt)
        this.Passwd     = hash_pwd

        this.Save()
        console.log(`password-updated. user: ${this}`)
    }

}

module.exports =
{
    User : User
}