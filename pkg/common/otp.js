const twilio_sid   = process.env.TWILIO_ACCOUNT_SID
    , twilio_token = process.env.TWILIO_AUTH_TOKEN
    , twilio       = require("twilio")(twilio_sid, twilio_token)
    , Org          = process.env.ORGANISATION
    ,  nodemailer  = require("nodemailer")
    , bcrypt       = require("bcryptjs")
    , test         = require("./test")

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
  this.Data =
  {
      MobNo     : data.MobNo
    , EmailID   : data.MailID
    , Body      : data.Body
    , OtpLen    : 6
  }
  this.Otp      = ''
  
  this.GenOtp = function (len)
  {
    this.Otp = Math.random()
                   .toFixed(len)
                   .substr(`-${len}`)
    test.Set('OTP', this.Otp) // #101
  }

  this.Confirm = async function (hash, otp)
  {
    const result = await bcrypt.compare(otp, hash)
    if(!result) console.log('wrong-otp')
    else console.log('otp-confirmed')
    return result
  }
  
  this.SMS = async function(retries = 3)
  {
    if (retries <= 0 || !this.Data.MobNo) 
    {
      if (!this.Data.MobNo) {console.log('no-mobile-no', this.Data)}
      return false
    }
    
    const msg =
    {
        body  : this.Data.Body.format(this.Otp)
      , from  : process.env.MOB_NO
      , to    : this.Data.MobNo
    }

    try { await twilio.messages.create(msg) }
    catch(err) 
    {
      // TODO add a sleep here
      console.log('sms-transmission-failed', 
          { 
            Data      : this.Data,
            Error     : 
            { 
              Status  : err.status, 
              Code    : err.status, 
              Info    : err.moreInfo, 
              Details : err.details
            }
          })
      await this.SMS(--retries)
    }
  }
  
  this.Email = async function(retries = 3)
  {
    if (retries <= 0 || !this.Data.EmailID)
    {
      if (!this.Data.EmailID) {console.log('no-mail-id', this.Data)}
      return false
    }

    let email =
    {
        from    : process.env.EMAIL
      , to      : this.Data.EmailID
      , subject : this.Data.Body
      , html    : this.Data.Body.format(this.Otp)
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
      console.log('email-transmission-failed',
      { 
        Data      : this.Data,
        Error     : 
        { 
          Status  : err.status, 
          Code    : err.status, 
          Info    : err.moreInfo, 
          Details : err.details
        }
      })
      await this.Email(--retries) 
    }
  }

  this.Send = async function (opts) 
  { 
    console.log('####OTP-blocked-for-testing-purpose###')

    console.log('send-otp', { MobileNo : this.Data.MobNo, Email : this.Data.EmailID, Options: opts})
    this.GenOtp(this.Data.OtpLen)
    /*//
    switch (opts)
    {
      case Opts.SMS   : await this.SMS();   break;
      case Opts.MAIL  : await this.Email(); break;
      default         : await this.SMS(); await this.Email();
    }//*/

    let   salt = this.Data.OtpLen
        , hash = await bcrypt.hash(this.Otp, salt)
    console.log('otp-send', { MobileNo : this.Data.MobNo, Email : this.Data.EmailID})
    return hash
  }
}

module.exports =
{
    OneTimePasswd : OneTimePasswd
  , Msgs          : Msgs
  , Opts          : Opts
}