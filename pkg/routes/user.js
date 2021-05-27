const { code, status, text }  = require("../common/error")
    , router                  = require("express").Router()
    , { User }                = require("../objects/user")
    , { task }                = require("../common/models")

router.post("/register", async (req, res, next) => 
{
  try
  {

    let log = { ...req.body }
    if (req.body['OTP'])      delete log.OTP
    if (req.body['Password']) delete log.Password

    /*  To avoid OTP read from logs
        Expected attack sequence: 
        1) Read OTP from following log
        2) Crash running server bin
        3) Try again with the creds */

    console.log('register-user',log)
    let text_ = '', data_ = {}, user
    switch (req.body.Task)
    {
      case task.New:
        user = new User(req.body.MobileNo, req.body.Mode)
        await user.New()
        text_ = text.OTPSendToMobNo.format(req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        user  = new User()
        const token = await user.ConfirmMobNo(req.body)
        text_ = text.OTPConfirmed
        data_ = {Token: token}
        break

      case task.Register:
        user  = new User()
        console.log(req.headers)
        await user.Auth(req.headers["authorization"])
        await user.Register(req.body)
        text_ = text.Registered
        break
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_ })

  } catch(err) { next(err) }
})

// Login
// validator.verify_login,
router.post( "/login", async (req, res, next) =>
{
  try
  {
    const user  = new User()
    const token = await user.Login(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.LoggedIn,
      Data    : {Token: token}
    })
  } catch (err) { next(err) }
})

// Set password reset flag
// validator.validate_uid,
router.post( "/password/forgot", async (req, res, next) =>
{
  try
  {
    console.log('forgot-password',req.body)

    let text_, data_, user
    switch (req.body.Task)
    {
      case task.GenOTP:
                user  = new User()
          const dest  = await user.SetPwdResetFlag(req.body)
          text_ = text.OTPSendVia.format(dest)      
          break

      case task.ConfirmOTP:
                user  = new User()
          const token = await user.ConfirmOTPOnPasswdReset(req.body)
          text_       = text.OTPConfirmed
          data_       = {Token: token}
          break

      case task.SetPasswd:
                user  = new User()
          await user.Auth(req.headers["authorization"])
          await user.UpdatePasswd(req.body.Password)
          text_       = text.PasswdUpdated
          break
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_
    })
  } catch (err) { next(err) }
})

// Read Profile
router.get("/profile", async (req, res, next) => {
  try {
    const user  = new User()
    await user.Auth(req.headers["authorization"])

    const data = 
    {
        Name      : user.Name
      , MobileNo  : user.MobNo
      , Email     : user.Email
      , Mode      : user.Mode
    }
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Edit Password
router.put("/profile", async (req, res, next) =>
{
  try 
  {
    let text_
    const user  = new User()
    await user.Auth(req.headers["authorization"])

    switch (req.body.Task)
    {
      case task.EditPasswd:
        if (!user.ComparePasswd(user.Passwd, req.body.Password))
        { 
          return res.status(code.BAD_REQUEST).json({
            Status  : status.Failed,
            Text    : reason.IncorrectCredentials,
            Data    : {}
          })
        }
        user.ResetPasswd = true
        user.UpdatePasswd(req.body.Password)
        text_ = text.PasswdUpdated
        break

      case task.EditProfile:
        user.Name   = req.body.Name
        user.Email  = req.body.Email
        user.Save(req.body)
        text_ = text.ProfileUpdated
        break
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router