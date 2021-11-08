const { Err_ }     = require('../../system/models')
    , otp          = require('../../infra/otp')
    , jwt          = require('../../infra/jwt')
    , { ObjectID } = require('mongodb')
    , { Cart }     = require('../cart/driver')
    , Model        = require('../../system/models')
    , db           = require('../exports')[Model.segment.db][Model.resource.user]

function User(data)
{
    if(data)
    this.Data =
    {
        MobileNo      : data.MobileNo
      , Mode          : data.Mode
      , _id           : ''
      , Otp           : ''
      , State         : Model.states.None
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
        let user = await db.Get(this.Data.MobileNo, Model.query.ByMobileNo)
        if (user && user.State === Model.states.Registered)
        {
            const otp_sms = new otp.OneTimePasswd({
                            MobileNo: 	user.MobileNo, 
                            Body: 	Model.message.OnAuth })
                , hash    = await otp_sms.Send(Model.gw.SMS)

            user.Otp = hash
            await db.Save(user)
            return
        }

        const otp_sms = new otp.OneTimePasswd({
                        MobileNo: 	this.Data.MobileNo, 
                        Body: 	Model.message.OnAuth })
            , hash    = await otp_sms.Send(Model.gw.SMS)

        if(!user) { this.Data._id = new ObjectID() }
        else { this.Data._id = user._id }

        this.Data.Otp             = hash
        this.Data.State           = Model.states.New
        await db.Save(this.Data)
        console.log('user-created', { User: this.Data})
    }

    this.ConfirmMobileNo   = async function (data)
    {
        this.Data = await db.Get(data.MobileNo, Model.query.ByMobileNo)
        if (!this.Data) Err_(Model.code.BAD_REQUEST, Model.reason.UserNotFound)

        const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
            , status = await otp_.Confirm(this.Data.Otp, data.OTP)

        if (!status) 
        {
            Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
        }

        const token = await jwt.Sign({ _id : this.Data._id, Mode : this.Data.Mode })

        if (this.Data.State === Model.states.Registered)
        {
            console.log('user-exists-logging-in', { User: this.Data })            
            return {
                  Token: token
                , Command: Model.command.LoggedIn
            }
        }
        this.Data.State = Model.states.MobConfirmed
        this.Data.Otp   = ''
        await db.Save(this.Data)
        console.log('user-mobile-number-confirmed', { User: this.Data })

        return {
            Token: token
          , Command: Model.command.Register
        }
    }

    this.Register   = async function (data)
    {
        if (data.User.State !== Model.states.MobConfirmed)
        Err_(Model.code.BAD_REQUEST, Model.reason.MobileNoNotConfirmed)

        const cart       = new Cart(data.User._id)
        data.User.CartID = await cart.Create()
        data.User.Name   = data.Name
        data.User.Email  = data.Email        
        data.User.State  = Model.states.Registered

        await db.Save(data.User)
        console.log('user-registered', 
        {  UserID  : data.User._id 
         , Name    : data.Name       
         , Email   : data.Email    })
    }

    this.Edit   = async function (data)
    {
        if ( data.User.State !== Model.states.Registered)
        Err_(Model.code.BAD_REQUEST, Model.reason.IncompleteRegistration)

        let rcd = { _id : data.User._id }
        if(data.Name ) rcd.Name  = data.Name 
        if(data.Email) rcd.Email = data.Email
        if(data.Longitude && data.Latitude)
        rcd.Location =
        {
            type        : 'Point'
          , coordinates : [data.Longitude.loc(), data.Latitude.loc()]
        }

        await db.Save(rcd)
        console.log('profile-updated', {User: rcd })
    }

}

module.exports =
{
    User : User
}