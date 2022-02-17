const router 	= require('express').Router()
    , Model   = require('../../../sys/models')
    , Method  = require('./methods')
    , Handler = require('./handler')

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
        text_  = Model.text.OTPGenerated
        break

      case Model.task.ReadOTP:
        event_ = Model.event.Confirm
        text_  = Model.text.OTPConfirmed
        break

      case Model.task.Register:
        event_ = Model.event.Register
        text_  = Model.text.Registered
        break

      case Model.task.Approve:
        event_ = Model.event.Approve
        text_  = Model.text.Approved
        break
    }

    ctxt.Event =  event_
    data_      = await Handler.Transition(ctxt)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : text_,
      Data    : data_
    })
  } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) => {
    try 
    {
      let in_
      switch(req.body.Mode)
      {
        case Model.mode.Seller:
          in_ =
          {
              ID    : req.body.Seller._id
            , Mode  : req.body.Mode
            , Seller : req.body.Seller
          }
          break
        default:
          in_ =
          {
              ID    : req.query.SellerID
            , Mode  : req.body.Mode
            , Seller : {}
          }          
          break
      }
      const data  = await Method.Get(in_)

      return res.status(Model.code.OK).json({
        Status  : Model.status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})


router.get('/list', async (req, res, next) =>
{
    try 
    {
      const data  = await Method.List(req.query, req.body.Mode)
      
      return res.status(Model.code.OK).json({
        Status  : Model.status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.put('/edit', async (req, res, next) =>
{
  try 
  {
    await Method.Edit(req.body)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})


module.exports = router