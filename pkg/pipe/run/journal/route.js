const Model   = require('../../../sys/models')
    , router 	= require('express').Router()
    , journal = require('./handlers')
    , Transit = require('../transit/driver')

router.post('/create', async (req, res, next) =>
{
  try
  {

    const ret = await journal.Create(req.body)

    if(req.body.IsCOD)
    {
      let transit = new Transit(ret.Journal)
      await transit.Init(ret.Journal.Transit.ID)
    }

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.PaymentInitiated,
      Data    : ret.Response
    })
  } catch (err) { next(err) }
})

// List Journals
router.get('/list', async (req, res, next) =>
{
  try
  {

    let in_
    switch (req.body.Mode)
    {
      case Model.mode.Seller  : in_ = req.body.Seller  ; break
      case Model.mode.Agent   : in_ = req.body.Agent   ; break
      case Model.mode.Arbiter : in_ = req.body.Arbiter ; break
      case Model.mode.Client  : in_ = req.body.Client  ; break
    }

    const data    = await journal.List(req.query, in_, req.body.Mode)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// View Journal
router.get('/view', async (req, res, next) =>
{
  try
  {

    let in_
    switch (req.body.Mode) 
    {
      case Model.mode.Seller  : in_ = req.body.Seller  ; break
      case Model.mode.Agent   : in_ = req.body.Agent   ; break
      case Model.mode.Arbiter : in_ = req.body.Arbiter ; break
      case Model.mode.Client  : in_ = req.body.Client  ; break
    }

    const data    = await journal.Read(req.query, in_, req.body.Mode)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router