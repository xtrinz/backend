const otp    = require('../../../infra/otp')
    , jwt    = require('../../../infra/jwt')
    , Model  = require('../../../sys/models')
    , ledger = require('../../fin/ledger/driver')
    , db     = require('../../exports')[Model.segment.db]
    , Client = require('./model')
    , cart   = require('../../fin/cart/driver')
    , Log    = require('../../../sys/log')

const Context	= async function(data, resp)
{
    let client_ = await db.client.Get(data.MobileNo, Model.query.ByMobileNo)
    if (!client_)
    {
        Log('client-not-found-setting-new-context', 
        { 
            MobileNo: data.MobileNo 
        })
        client_ = new Client({ MobileNo: data.MobileNo })
    }

    let ctxt =
    {
          Client   : client_
        , Data   : data
        , Return : resp
    }
    Log('client-context', { Context: ctxt })
    return ctxt
}

const Create	= async function(ctxt)
{
    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Client.MobileNo, 
                    Body: 	Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Client.Otp   = hash
    ctxt.Client.State = Model.states.New

    await db.client.Save(ctxt.Client)

    Log('client-created', { Context: ctxt })

    return {}
}

const Login		= async function(ctxt)
{
    Log('client-login', { Context: ctxt })

    const otp_sms = new otp.OneTimePasswd({
                    MobileNo: 	ctxt.Client.MobileNo, 
                    Body: 	    Model.message.OnAuth })
        , hash    = await otp_sms.Send(Model.gw.SMS)

    ctxt.Client.Otp = hash
    await db.client.Save(ctxt.Client)

    Log('client-login-otp-sent', { Context: ctxt })
    return {}
}

const Confirm   = async function (ctxt)
{
    const otp_   = new otp.OneTimePasswd({MobileNo: '', Body: ''})
        , status = await otp_.Confirm(ctxt.Client.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    const token = await jwt.Sign({ _id : ctxt.Client._id, Mode : Model.mode.Client })

    ctxt.Client.State = Model.states.MobConfirmed
    ctxt.Client.Otp   = ''
    await db.client.Save(ctxt.Client)
    Log('client-mobile-number-confirmed', { Client: ctxt.Client })

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
        , status = await otp_.Confirm(ctxt.Client.Otp, ctxt.Data.OTP)
    if (!status) 
    {
        Log('otp-mismatch', { Context: ctxt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.OtpRejected)
    }

    Log('client-exists-logging-in', { Client: ctxt.Client })

    ctxt.Client.Otp = ''
    await db.arbiter.Save(ctxt.Client)

    const token = await jwt.Sign({ _id : ctxt.Client._id, Mode : Model.mode.Client })

    ctxt.Return.setHeader('authorization', token)
    let data_ = 
    {
        Name      : ctxt.Client.Name
      , MobileNo  : ctxt.Client.MobileNo
      , Email     : ctxt.Client.Email      
      , Mode      : Model.mode.Client
      , Command   : Model.command.LoggedIn
    }
    return data_
}

const Register  = async function (ctxt)
{
    ctxt.Client.CartID   = await   cart.Create(ctxt.Client._id)
    ctxt.Client.LedgerID = await ledger.Create(ctxt.Client)
    ctxt.Client.Name     = ctxt.Data.Name
    ctxt.Client.Email    = ctxt.Data.Email
    ctxt.Client.State    = Model.states.Registered

    await db.client.Save(ctxt.Client)

    Log('client-registered', 
    {  Client  : ctxt.Client })

    let data_ = 
    {
        Name      : ctxt.Client.Name
      , MobileNo  : ctxt.Client.MobileNo
      , Email     : ctxt.Client.Email
      , Mode      : Model.mode.Client
      , Command   : Model.command.LoggedIn
    }
    return data_    
}

const Edit      = async function (ctxt)
{

    let rcd = { _id : ctxt.Client._id }

    if(ctxt.Data.Name ) rcd.Name = ctxt.Data.Name 

    if(ctxt.Data.Longitude && ctxt.Data.Latitude)
    rcd.Location =
    {
        type        : 'Point'
      , coordinates : [ctxt.Data.Longitude.loc(), ctxt.Data.Latitude.loc()]
    }

    await db.client.Save(rcd)
    Log('profile-updated', {Context: ctxt})
}

module.exports =
{
    Create,     Login,      Confirm,
    Token,      Register,   Edit,
    Context
}