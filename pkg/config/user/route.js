const { code, status, text }  = require('../../system/models')
    , router                  = require('express').Router()
    , { User }                = require('../user/driver')
    , { task }                = require('../../system/models')

router.post('/register', async (req, res, next) => 
{
  try
  {
    let text_ = '', data_ = {}, user
    switch (req.body.Task)
    {
      case task.New:
        user = new User(req.body)
        await user.New()
        text_ = text.OTPSendToMobileNo.format(req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        user  = new User()
        const token = await user.ConfirmMobileNo(req.body)
        text_ = text.OTPConfirmed
        res.setHeader('authorization', token)
        break

      case task.Register:
        user  = new User()
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

// Read Profile
router.get('/profile', async (req, res, next) => {
  try {

    const data = 
    {
        Name      : req.body.User.Name
      , MobileNo  : req.body.User.MobileNo
      , Email     : req.body.User.Email
      , Mode      : req.body.User.Mode
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
    await user.Edit(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router