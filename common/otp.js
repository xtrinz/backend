const   twilio_sid    = process.env.TWILIO_ACCOUNT_SID
      , twilio_token  = process.env.TWILIO_AUTH_TOKEN
      , twilio        = require("twilio")(twilio_sid, twilio_token)
      , Org           = process.env.ORGANISATION
const   nodemailer    = require("nodemailer")
const   bcrypt        = require("bcryptjs");

const Msgs =
{
      OnAuth    : `Your ${Org} authentication code is X-{0}`
    , ForPkg    : `Your package collection code is X-{0}`
    , EmailSub  : `OTP confirmation alert from ${Org}`
    , EmailBody : `Your One Time Password(OTP) is : X-{0}`
    , ResetPass : `Your OTP to reset password is : X-{0}`
}

const Opts =
{
      SMS : 'SMS'
    , MAIL: 'MAIL'
}

function OneTimePasswd(data)
{
  this =
  {
          MobNo     : data.MobNo
        , Email     : data.MailID
        , Body      : data.Body
        , OtpLen    : 6
        , Otp       : ''
  }
  
  this.GenOtp = function (len)
  {
    this.Otp = Math.random()
                   .toFixed(len)
                   .substr(`-${len}`)
  }

  this.Confirm = async function (hash, otp)
  {
    const result = await bcrypt.compare(otp, hash)
    if(!result)
    {
      console.log('wrong-otp')
    } else
    {
      console.log('otp-confirmed')
    }
    return result
  }
  
  this.SMS = async function(retries = 3)
  {
    if (retries <= 0) return;
    
    const msg =
    {
        body  : this.Body.format(this.Otp)
      , from  : process.env.MOB_NO
      , to    : this.MobNo
    }

    try { await twilio.messages.create(msg) }
    catch(err) 
    {
      // TODO add a sleep here
      await this.Email(--retries)
    }
  }
  
  this.Email = async function(retries = 3)
  {
    if (retries <= 0) return;

    let email =
    {
        from    : process.env.EMAIL
      , to      : this.Email
      , subject : this.Body
      , html    : this.Body.format(this.Otp)
    }
    
    const svc = nodemailer.createTransport(
    {
      service: "gmail", // ?less secure of gmail enabled. catche access enabled
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    })
    try { await svc.sendMail(email) }
    catch(err) 
    {
      // TODO add a sleep here
      await this.Email(--retries) 
    }
  }

  this.Send = async function (opts) 
  { 
    console.log('send-otp', this.MobNo, this.Email, opts)
    this.GenOtp(this.OtpLen)

    switch (opts)
    {
      case Opts.SMS   : this.SMS();   break;
      case Opts.Email : this.Email(); break;
      default         : this.SMS(); this.Email();
    }
    
    let   salt = this.OtpLen
        , hash = await bcrypt.hash(this.Otp, salt)
    console.log('otp-send', this.MobNo, this.Email, hash)
    return hash
  }
}

module.exports =
{
    OneTimePasswd : OneTimePasswd
  , Msgs          : Msgs
  , Opts          : Opts
}