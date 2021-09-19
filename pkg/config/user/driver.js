const { states, query, message, gw,
        Err_, code, reason, mode}          = require('../../system/models')
    , otp                            = require('../../infra/otp')
    , jwt                            = require('../../infra/jwt')
    , { ObjectID }                   = require('mongodb')
    , { Cart }                       = require('../cart/driver')
    , db                             = require('../user/archive')

function User(data)
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
        , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
      }
      , IsLive        : false
    }

    this.New      = async function ()
    {
        let user = await db.Get(this.Data.MobileNo, query.ByMobileNo)
        if (user && user.State === states.Registered)
        Err_(code.BAD_REQUEST, reason.UserFound)

        if(this.Data.Mode     === mode.Admin &&
            !process.env.ADMIN_MOB_NO.split(' ').includes(this.Data.MobileNo))
        {
            console.log('unmatched-mobile-no-seed-unknown-admin', { Admin: this.Data })
            Err_(code.NOT_FOUND, reason.Unauthorized)
        }

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
        if (!this.Data) Err_(code.BAD_REQUEST, reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) Err_(code.BAD_REQUEST, reason.OtpRejected)

        const token = await jwt.Sign({ _id : this.Data._id, Mode : this.Data.Mode })

        if (this.Data.State === states.Registered)
        {
            console.log('user-exists-logging-in', { User: this.Data })            
            return token
        }
        this.Data.State = states.MobConfirmed
        this.Data.Otp   = ''
        await db.Save(this.Data)
        console.log('user-mobile-number-confirmed', { User: this.Data })
        
        return token
    }

    this.Register   = async function (data)
    {
        if (data.User.State !== states.MobConfirmed)
        Err_(code.BAD_REQUEST, reason.MobileNoNotConfirmed)

        const cart       = new Cart(data.User._id)
        data.User.CartID = await cart.Create()
        data.User.Name   = data.Name
        data.User.Email  = data.Email        
        data.User.State  = states.Registered

        await db.Save(data.User)
        console.log('user-registered', 
        {  UserID  : data.User._id 
         , Name    : data.Name       
         , Email   : data.Email    })
    }

    this.Edit   = async function (data)
    {
        if ( data.User.State !== states.Registered)
        Err_(code.BAD_REQUEST, reason.IncompleteRegistration)

        let rcd = { _id : data.User._id }
        if(data.Name ) rcd.Name  = data.Name 
        if(data.Email) rcd.Email = data.Email

        await db.Save(rcd)
        console.log('profile-updated', {User: this.Data})
    }

}

module.exports =
{
    User : User
}