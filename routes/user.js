const { code, status, text }  = require("../common/error")
    , router                  = require("express").Router()
    , { User }                = require("../objects/user")
    , { task }                = require("../common/models")

/*Register
  Login
  Forgot Password
  Profile: GET
  Profile: PUT
  TODO: Confirm Email */

// Set Mobile Number
// const validator = require("../../validators/customer/register")
// validator.register,
router.post("/user/register", async (req, res, next) => 
{
  try
  {
    console.log('register-user',req.body)
    let text_, data_
    switch (req.body.Task) // Block unknown task at I/O validation itself
    {
      case task.New:
        const user = new User(req.body.MobNo, req.body.Mode)
        await user.New()
        text_ = text.OTPSendToMobNo.format(req.body.MobNo.slice(-4))
        break

      case task.ReadOTP:
        const user  = new User()
        const token = await user.ConfirmMobNo(req.body)
        text_ = text.OTPConfirmed
        data_ = {Token: token}
        break

      case task.Register:
        const user  = new User()
        await user.Auth(req.headers["Authorization"])
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
router.post( "/user/login", async (req, res, next) =>
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
router.post( "/user/password/forgot", async (req, res, next) =>
{
  try
  {
    console.log('forgot-password',req.body)

    let text_, data_
    switch (req.body.Task)
    {
      case task.GenOTP:
          const   user  = new User()
                , dest  = await user.SetPwdResetFlag(req.body)
          text_ = text.OTPSendVia.format(dest)      
          break

      case task.ConfirmOTP:
          const user  = new User()
          const token = await user.ConfirmOTPOnPasswdReset(req.body)
          text_       = text.OTPConfirmed
          data_       = {Token: token}
          break

      case task.SetPasswd:
          const user  = new User()
          await user.Auth(req.headers["Authorization"])
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
router.get("/user/profile", async (req, res, next) => {
  try {
    const user  = new User()
    await user.Auth(req.headers["Authorization"])

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
router.put("/user/profile", async (req, res, next) =>
{
  try 
  {
    let text_
    const user  = new User()
    await user.Auth(req.headers["Authorization"])

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