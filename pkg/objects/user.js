const { users }               = require("../common/database")
    , { states, query, mode } = require("../common/models")
    , { Err_, code, reason}   = require('../common/error')
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
      , SockID     : []
      , AddressList: []
      , StoreList  : 
      {
          Owned    : []    // Created By User
        , Accepted : []    // Managed By User
        , Pending  : []    // Invitation Received for management
      }  
      , ResetPasswd: false
      , IsLive     : false
    }
    this.Save       = async function()
    {
        console.log('save-user', this.Data)
        const query = { _id : this.Data._id }
            , act   = { $set : this.Data }
            , opt   = { upsert : true }
        const resp  = await users.updateOne(query, act, opt)
        if (!resp.result.ok)
        {
            console.log('user-save-failed', { Data: this.Data, Result: resp.result})
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
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

    this.NearbyAgents = async function(ln, lt)
    {
        console.log('list-nearby-live-agents', {Location: [ln, lt]})
        /* Agent { _id, Name, SocketID }, count <=10,
           Nearest, Live, Radius < 5km             */
        const cnt     = 10
            , maxDist = 5000
            , proj    = { _id: 1, Name: 1, SockID: 1 }
            , query   =
            { 
/*              Location  :
                {
                $near :
                {
                  $geometry    : { type: "Point", coordinates: [ln, lt] }
                , $maxDistance : maxDist
                }
                }*/
                  IsLive  : true
                , Mode    : mode.Agent
            }
        const agents = await users.find(query).project(proj).limit(cnt).toArray()
        if (!agents.length)
        {
            console.log('no-agents-found',{ Location: [ln, lt]})
            return
        }
        console.log('agents-found', { Agents: agents})
        return agents
    }

    this.Auth   = async function (token)
    {
        if (!token) Err_(code.BAD_REQUEST, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = await jwt.Verify(token)
        if (!res || !res._id) Err_(code.BAD_REQUEST, reason.UserNotFound)

        const user = await this.Get(res._id, query.ByID)
        if (!user)
        {
            console.log('user-not-found', {UserID: res._id})
            Err_(code.BAD_REQUEST, reason.UserNotFound)
        }
        console.log('user-authenticated', {User: this.Data})
    }

    this.New      = async function ()
    {
        let user = await this.Get(this.Data.MobNo, query.ByMobNo)
        if (user && user.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.UserFound)

        const otp_sms = new otp.OneTimePasswd({
                        MobNo: 	this.Data.MobNo, 
                        Body: 	otp.Msgs.OnAuth })
            , hash    = await otp_sms.Send(otp.Opts.SMS)

        if(!user) { this.Data._id = new ObjectID() }
        this.Data.Otp             = hash
        this.Data.State           = states.New
        await this.Save()
        console.log('user-created', { User: this.Data})
    }

    this.ConfirmMobNo   = async function (data)
    {
        let user     = await this.Get(data.MobileNo, query.ByMobNo)
        if (!user || user.State === states.Registered)
           Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobNo: "", Body: ""})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, reason.OtpRejected)

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
        Err_(code.BAD_REQUEST, reason.MobNoNotConfirmed)

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

        let user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        let status = await bcrypt.compare(data.Password, user.Passwd) // (data, hash) keep sign in order
        if (!status) Err_(code.BAD_REQUEST, reason.IncorrectCredentials)

        console.log('user-loggedin', {Name: user.Name, UserID: user._id})        
        const token = await jwt.Sign({ _id: user._id })
        return token
    }

    this.EnableEditPassword   = async function (data)
    {

        let param, qType, via
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobNo; via = otp.Opts.SMS }
        else               { param = data.Email;    qType = query.ByMail;  via = otp.Opts.MAIL }

        let user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_  = new otp.OneTimePasswd({
                        MobNo:  user.MobNo,
                        Email:  user.Email,
                        Body:   otp.Msgs.ResetPass })
        const hash  = await otp_.Send(via) 
        
        this.Data.Otp         = hash
        this.Data.ResetPasswd = true
        await this.Save()

        console.log('user-password-flag-set', 
            { 
                UserID  : user._id,
                MobileNo: data.MobileNo,
                Email   : data.Email
            })
        return via
    }

    this.AuthzEditPassword   = async function (data)
    {
        let param, qType
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobNo }
        else               { param = data.Email;    qType = query.ByMail  }

        let user = await this.Get(param, qType)
        if (!user || user.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobNo: this.Data.MobNo, Body: ""})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)
        if (!this.Data.ResetPasswd || !status)
        Err_(code.BAD_REQUEST, reason.OtpRejected)

        this.Data.Otp = ''
        await this.Save()

        console.log('authorized-edit-password', {User: this.Data})
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.UpdatePasswd   = async function (passwd)
    {
        if ( this.Data.State !== states.Registered ||
            !this.Data.ResetPasswd)
        {
            let reason_ = reason.IncompleteRegistration
            if(!this.Data.ResetPasswd) { reason_ = reason.PasswdResetNotPermited }
            Err_(code.BAD_REQUEST, reason_)
        }
        this.Data.Passwd      = await bcrypt.hash(passwd, 5) // salt =5
        this.Data.ResetPasswd = false
        await this.Save()
        console.log('password-updated', {User: this.Data})
    }

    this.EditProfile   = async function (data)
    {
        if ( this.Data.State !== states.Registered)
            Err_(code.BAD_REQUEST, reason.IncompleteRegistration)

        if(data.Password)
        {                                        // (data, hash) keep sign in order
            let status        = await bcrypt.compare(data.Password, this.Data.Passwd)
            if (!status) Err_(code.BAD_REQUEST, reason.IncorrectCredentials)
            this.Data.Passwd  = await bcrypt.hash(data.NewPassword, 5) // salt =5
        }
        if(data.Name ) { this.Data.Name  = data.Name  }
        if(data.Email) { this.Data.Email = data.Email }
        await this.Save()
        console.log('profile-updated', {User: this.Data})
    }

}

module.exports =
{
    User : User
}