const { code, status, states
    ,   text, task, command } = require('../../system/models')
    , router         = require('express').Router()
    , { User }       = require('../user/driver')

router.post('/register', async (req, res, next) => 
{
  try
  {
    let text_ = '', data_ = {}, user, info_
    switch (req.body.Task)
    {
      case task.New:
        user = new User(req.body)
        await user.New()
        text_ = text.OTPSendToMobileNo.format(req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        user  = new User()
        const resp = await user.ConfirmMobileNo(req.body)
        text_ = text.OTPConfirmed
        info_ = user.Data
        info_.Command = resp.Command
        res.setHeader('authorization', resp.Token)
        break

      case task.Register:
        user  = new User()
        info_ = req.body.User
        info_.Command = command.LoggedIn
        await user.Register(req.body)
        text_ = text.Registered
        break
    }

    if(info_ && info_.State === states.Registered)
    data_ = 
    {
        Name      : info_.Name
      , MobileNo  : info_.MobileNo
      , Email     : info_.Email
      , Mode      : info_.Mode
      , Command   : info_.Command
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