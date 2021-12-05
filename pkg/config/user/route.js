const Model     = require('../../system/models')
    , router    = require('express').Router()
    , Method    = require('./methods')
    , Handler   = require('./handler')

router.post('/register', async (req, res, next) => 
{
  try
  {
    let text_ = '', data_ = {}, event_
    let ctxt  = await Method.Context(req.body, res)

    switch (req.body.Task)
    {
      case Model.task.New:
        event_ = Model.event.Create
        text_  = Model.text.OTPSendToMobileNo.format(req.body.MobileNo.slice(-4))
        break

      case Model.task.ReadOTP:
        event_ = Model.event.Confirm
        text_  = Model.text.OTPConfirmed
        break

      case Model.task.Register:
        event_ = Model.event.Register
        text_  = Model.text.Registered
        break
    }

    ctxt.Event =  event_
    data_ = await Handler.Transition(ctxt)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
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
      , Mode      : Model.mode.User
    }

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.put('/profile', async (req, res, next) =>
{
  try 
  {

    let ctxt   =
    {
          User   : req.body.User
        , Data   : req.body
        , Return : {}
        , Event  : Model.event.Edit
    }

    await Handler.Transition(ctxt)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router