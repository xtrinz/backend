const { states, query, message, gw } = require('../../common/models')
    , { Err_, code, reason}          = require('../../common/error')
    , otp                            = require('../../infra/otp')
    , jwt                            = require('../../infra/jwt')
    , { ObjectID }                   = require('mongodb')
    , { Cart }                       = require('../cart/driver')
    , bcrypt                         = require('bcryptjs')
    , db                             = require('../user/archive')

function User(mob_no, user_mode)
{
    this.Data =
    {
        MobileNo      : mob_no
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

    this.Auth   = async function (token)
    {
        if (!token) Err_(code.BAD_REQUEST, reason.TokenMissing)

        token       = token.slice(7) // cut 'Bearer <token>'
        const res   = await jwt.Verify(token)
        if (!res || !res._id) Err_(code.BAD_REQUEST, reason.UserNotFound)

        this.Data = await db.Get(res._id, query.ByID)
        if (!this.Data)
        {
            console.log('user-not-found', {UserID: res._id})
            Err_(code.BAD_REQUEST, reason.UserNotFound)
        }
        console.log('user-authenticated', {User: this.Data})
    }

    this.New      = async function ()
    {
        let user = await db.Get(this.Data.MobileNo, query.ByMobileNo)
        if (user && user.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.UserFound)

        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	message.OnAuth })
            , hash    = await otp_sms.Send(gw.SMS)

        if(!user) { this.Data._id = new ObjectID() }
        this.Data.Otp             = hash
        this.Data.State           = states.New
        await db.Save(this.Data)
        console.log('user-created', { User: this.Data})
    }

    this.ConfirmMobileNo   = async function (data)
    {
        this.Data = await db.Get(data.MobileNo, query.ByMobileNo)
        if (!this.Data || this.Data.State === states.Registered)
           Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, reason.OtpRejected)

        this.Data.State = states.MobConfirmed
        this.Data.Otp   = ''
        await db.Save(this.Data)
        console.log('user-mobile-number-confirmed', { User: this.Data })
        
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.Register   = async function (data)
    {
        if (this.Data.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, reason.MobileNoNotConfirmed)

        const cart       = new Cart(this.Data._id)
        this.Data.CartID = await cart.Create()
        this.Data.Name   = data.Name
        this.Data.Passwd = await bcrypt.hash(data.Password, 5) // salt = 5hash_pwd
        this.Data.Email  = data.Email        
        this.Data.State  = states.Registered

        await db.Save(this.Data)
        console.log('user-registered', 
        {  UserID  : this.Data._id 
         , Name    : data.Name       
         , Email   : data.Email    })
    }

    this.Login   = async function (data)
    {
        let param, qType
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobileNo }
        else               { param = data.Email;    qType = query.ByMail  }

        this.Data = await db.Get(param, qType)
        if (!this.Data || this.Data.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        let status = await bcrypt.compare(data.Password, this.Data.Passwd) // (data, hash) keep sign in order
        if (!status) Err_(code.BAD_REQUEST, reason.IncorrectCredentials)

        console.log('user-loggedin', {Name: this.Data.Name, UserID: this.Data._id})        
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.EnableEditPassword   = async function (data)
    {

        let param, qType, via
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobileNo; via = gw.SMS  }
        else               { param = data.Email;    qType = query.ByMail;     via = gw.MAIL }

        this.Data = await db.Get(param, qType)
        if (!this.Data || this.Data.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_  = new otp.OneTimePasswd({
                        MobileNo :  this.Data.MobileNo,
                        Email    :  this.Data.Email,
                        Body     :  message.ResetPass })
        const hash  = await otp_.Send(via) 
        
        this.Data.Otp         = hash
        this.Data.ResetPasswd = true
        await db.Save(this.Data)

        console.log('user-password-flag-set',
        {     UserID   : this.Data._id 
            , MobileNo : data.MobileNo       
            , Email    : data.Email    }) 

        return via
    }

    this.AuthzEditPassword   = async function (data)
    {
        let param, qType
        if (data.MobileNo) { param = data.MobileNo; qType = query.ByMobileNo }
        else               { param = data.Email;    qType = query.ByMail  }

        this.Data = await db.Get(param, qType)
        if (!this.Data || this.Data.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: this.Data.MobileNo, Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!this.Data.ResetPasswd || !status)
        Err_(code.BAD_REQUEST, reason.OtpRejected)

        this.Data.Otp = ''
        await db.Save(this.Data)

        console.log('authorized-edit-password', {User: this.Data})
        const token = await jwt.Sign({ _id: this.Data._id })
        return token
    }

    this.UpdatePasswd   = async function (passwd)
    {
        if ( this.Data.State !== states.Registered || !this.Data.ResetPasswd)
        {
            let reason_ = (!this.Data.ResetPasswd)? reason.PasswdResetNotPermited : reason.IncompleteRegistration
            Err_(code.BAD_REQUEST, reason_)
        }
        this.Data.Passwd      = await bcrypt.hash(passwd, 5) // salt =5
        this.Data.ResetPasswd = false

        await db.Save(this.Data)
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
        await db.Save(this.Data)
        console.log('profile-updated', {User: this.Data})
    }

}

module.exports =
{
    User : User
}