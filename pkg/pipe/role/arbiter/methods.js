const otp     = require('../../../infra/otp')
    , jwt     = require('../../../infra/jwt')
    , Model   = require('../../../sys/models')
    , Log     = require('../../../sys/log')
    , db      = require('../../exports')[Model.segment.db]
    , Arbiter = require('./model')


const Context	= async function(data, resp)
{
    let arbiter_ = await db.arbiter.Get(data.MobileNo, Model.query.ByMobileNo)
    if (!arbiter_)
    {
        Log('arbiter-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        arbiter_ = new Arbiter({ MobileNo: data.MobileNo })
    }

    let ctxt =
    {
          Arbiter  : arbiter_
        , Data   : data
        , Return : resp
    }
    Log('arbiter-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    if(!process.env.ADMIN_MOB_NO
                .split(' ')
                .includes(ctxt.Arbiter.MobileNo))
    {
        Log('unknown-seed', { Context: ctxt })
        Model.Err_(Model.code.NOT_FOUND, Model.reason.Unauthorized)
    }

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Arbiter.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Arbiter.Otp   = hash
    ctxt.Arbiter.State = Model.states.New

    await db.arbiter.Save(ctxt.Arbiter)

    Log('arbiter-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    Log('arbiter-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Arbiter.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Arbiter.Otp = hash
    await db.arbiter.Save(ctxt.Arbiter)

    Log('arbiter-login-otp-sent', { Context: ctxt })
    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Arbiter.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Arbiter._id, Mode : Model.mode.Arbiter })

    ctxt.Arbiter.State = Model.states.MobConfirmed
    ctxt.Arbiter.Otp   = ''
    await db.arbiter.Save(ctxt.Arbiter)
    Log('arbiter-mobile-number-confirmed', { Arbiter: ctxt.Arbiter })

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
        , status = await otp_.Confirm(ctxt.Arbiter.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    Log('arbiter-exists-logging-in', { Arbiter: ctxt.Arbiter })

    ctxt.Arbiter.Otp = ''
    await db.arbiter.Save(ctxt.Arbiter)

    const token = await jwt.Sign({ _id : ctxt.Arbiter._id, Mode : Model.mode.Arbiter })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Arbiter.Name
      , MobileNo  : ctxt.Arbiter.MobileNo
      , Mode      : ctxt.Arbiter.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    ctxt.Arbiter.Name   = ctxt.Data.Name
    ctxt.Arbiter.State  = Model.states.Registered

    await db.arbiter.Save(ctxt.Arbiter)

    Log('arbiter-registered', 
    {  ClientID  : ctxt.Arbiter._id 
     , Name    : ctxt.Arbiter.Name })

    let data_ = 
    {
        Name      : ctxt.Arbiter.Name
      , MobileNo  : ctxt.Arbiter.MobileNo
      , Mode      : ctxt.Arbiter.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_    
}

const Edit      = async function (ctxt)
{

    let rcd = { _id : ctxt.Arbiter._id }

    if(ctxt.Data.Name ) rcd.Name = ctxt.Data.Name 

    if(ctxt.Data.Longitude && ctxt.Data.Latitude)
    rcd.Location =
    {
        type        : 'Point'
      , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }

    await db.arbiter.Save(rcd)
    Log('profile-updated', {Context: ctxt})
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Edit,
    Context
}