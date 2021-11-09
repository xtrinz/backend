const otp   = require('../../infra/otp')
    , jwt   = require('../../infra/jwt')
    , Model = require('../../system/models')
    , db    = require('../exports')[Model.segment.db]
    , Admin = require('./driver')

const Context	= async function(data, resp)
{
    let admin_ = await db.admin.Get(data.MobileNo, Model.query.ByMobileNo)
    if (!admin_)
    {
        console.log('admin-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        admin_ = new Admin({ MobileNo: data.MobileNo })
    }

    let ctxt =
    {
          Admin  : admin_
        , Data   : data
        , Return : resp
    }
    console.log('admin-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    if(!process.env.ADMIN_MOB_NO
                .split(' ')
                .includes(ctxt.Admin.MobileNo))
    {
        console.log('unknown-seed', { Context: ctxt })
        Model.Err_(Model.code.NOT_FOUND, Model.reason.Unauthorized)
    }

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Admin.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Admin.Otp   = hash
    ctxt.Admin.State = Model.states.New

    await db.admin.Save(ctxt.Admin)

    console.log('admin-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    console.log('admin-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Admin.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Admin.Otp = hash
    await db.admin.Save(ctxt.Admin)

    console.log('admin-login-otp-sent', { Context: ctxt })
    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Admin.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        console.log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Admin._id, Mode : Model.mode.Admin })

    ctxt.Admin.State = Model.states.MobConfirmed
    ctxt.Admin.Otp   = ''
    await db.admin.Save(ctxt.Admin)
    console.log('admin-mobile-number-confirmed', { Admin: ctxt.Admin })

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
        , status = await otp_.Confirm(ctxt.Admin.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        console.log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    console.log('admin-exists-logging-in', { Admin: ctxt.Admin })

    const token = await jwt.Sign({ _id : ctxt.Admin._id, Mode : Model.mode.Admin })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Admin.Name
      , MobileNo  : ctxt.Admin.MobileNo
      , Mode      : ctxt.Admin.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    ctxt.Admin.Name   = ctxt.Data.Name
    ctxt.Admin.State  = Model.states.Registered

    await db.admin.Save(ctxt.Admin)

    console.log('admin-registered', 
    {  UserID  : ctxt.Admin._id 
     , Name    : ctxt.Admin.Name })

    let data_ = 
    {
        Name      : ctxt.Admin.Name
      , MobileNo  : ctxt.Admin.MobileNo
      , Mode      : ctxt.Admin.Mode
      , Command   : Model.command.LoggedIn
    }
    return data_    
}

const Edit      = async function (ctxt)
{

    let rcd = { _id : ctxt.Admin._id }

    if(ctxt.Data.Name ) rcd.Name = ctxt.Data.Name 

    if(ctxt.Data.Longitude && ctxt.Data.Latitude)
    rcd.Location =
    {
        type        : 'Point'
      , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }

    await db.admin.Save(rcd)
    console.log('profile-updated', {Context: ctxt})
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Edit,
    Context
}