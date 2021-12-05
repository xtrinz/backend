const otp   = require('../../infra/otp')
    , jwt   = require('../../infra/jwt')
    , Model = require('../../system/models')
    , db    = require('../exports')[Model.segment.db]
    , User  = require('./model')
    , cart  = require('../cart/driver')

const Context	= async function(data, resp)
{
    let user_ = await db.user.Get(data.MobileNo, Model.query.ByMobileNo)
    if (!user_)
    {
        console.log('user-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        user_ = new User({ MobileNo: data.MobileNo })
    }

    let ctxt =
    {
          User   : user_
        , Data   : data
        , Return : resp
    }
    console.log('user-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.User.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.User.Otp   = hash
    ctxt.User.State = Model.states.New

    await db.user.Save(ctxt.User)

    console.log('user-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    console.log('user-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.User.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.User.Otp = hash
    await db.user.Save(ctxt.User)

    console.log('user-login-otp-sent', { Context: ctxt })
    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.User.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        console.log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.User._id, Mode : Model.mode.User })

    ctxt.User.State = Model.states.MobConfirmed
    ctxt.User.Otp   = ''
    await db.user.Save(ctxt.User)
    console.log('user-mobile-number-confirmed', { User: ctxt.User })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
       Command   : Model.command.Register
    }
    return data_
}

const Token     = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.User.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        console.log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    console.log('user-exists-logging-in', { User: ctxt.User })

    const token = await jwt.Sign({ _id : ctxt.User._id, Mode : Model.mode.User })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.User.Name
      , MobileNo  : ctxt.User.MobileNo
      , Email     : ctxt.User.Email      
      , Mode      : Model.mode.User
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    ctxt.User.CartID = await cart.Create(ctxt.User._id)
    ctxt.User.Name   = ctxt.Data.Name
    ctxt.User.Email  = ctxt.Data.Email
    ctxt.User.State  = Model.states.Registered

    await db.user.Save(ctxt.User)

    console.log('user-registered', 
    {  User  : ctxt.User })

    let data_ = 
    {
        Name      : ctxt.User.Name
      , MobileNo  : ctxt.User.MobileNo
      , Email     : ctxt.User.Email
      , Mode      : Model.mode.User
      , Command   : Model.command.LoggedIn
    }
    return data_    
}

const Edit      = async function (ctxt)
{

    let rcd = { _id : ctxt.User._id }

    if(ctxt.Data.Name ) rcd.Name = ctxt.Data.Name 

    if(ctxt.Data.Longitude && ctxt.Data.Latitude)
    rcd.Location =
    {
        type        : 'Point'
      , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }

    await db.user.Save(rcd)
    console.log('profile-updated', {Context: ctxt})
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Edit,
    Context
}