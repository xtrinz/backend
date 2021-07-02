const { code, status, text }  = require('../common/error')
    , router                  = require('express').Router()
    , { User }                = require('../driver/user')
    , { task }                = require('../common/models')

router.post('/register', async (req, res, next) => 
{
  try
  {
    let text_ = '', data_ = {}, user
    switch (req.body.Task)
    {
      case task.New:
        user = new User(req.body.MobileNo, req.body.Mode)
        await user.New()
        text_ = text.OTPSendToMobileNo.format(req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        user  = new User()
        const token = await user.ConfirmMobileNo(req.body)
        text_ = text.OTPConfirmed
        data_ = { Token : token }
        break

      case task.Register:
        user  = new User()
        await user.Auth(req.headers['authorization'])
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
router.post( '/login', async (req, res, next) =>
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

router.post( '/passwd/reset', async (req, res, next) =>
{
  try
  {
    console.log('edit-password',req.body)

    let text_, data_ = {}, user
    switch (req.body.Task)
    {
      case task.GenOTP:
                user  = new User()
          const dest  = await user.EnableEditPassword(req.body)
                text_ = text.OTPSendVia.format(dest)      
                break

      case task.ConfirmOTP:
                user  = new User()
          const token = await user.AuthzEditPassword(req.body)
                text_ = text.OTPConfirmed
                data_ = {Token: token}
                break

      case task.SetPassword:
                user  = new User()
          await user.Auth(req.headers['authorization'])
          await user.UpdatePasswd(req.body.Password)
                text_ = text.PasswdUpdated
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
router.get('/profile', async (req, res, next) => {
  try {
    const user  = new User()
    await user.Auth(req.headers['authorization'])

    const data = 
    {
        Name      : user.Data.Name
      , MobileNo  : user.Data.MobileNo
      , Email     : user.Data.Email
      , Mode      : user.Data.Mode
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.put('/profile', async (req, res, next) =>
{
  try 
  {
    const user  = new User()
    await user.Auth(req.headers['authorization'])
    await user.EditProfile(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router