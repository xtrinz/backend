const Model   = require('../../system/models')
    , router 	= require('express').Router()
    , journal = require('./handlers')

// List Journals
router.get('/list', async (req, res, next) =>
{
  try
  {

    let in_
    switch (req.body.Mode)
    {
      case Model.mode.Store: in_ = req.body.Store; break
      case Model.mode.Agent: in_ = req.body.Agent; break
      case Model.mode.Admin: in_ = req.body.Admin; break
      case Model.mode.User : in_ = req.body.User ; break
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
      case Model.mode.Store: in_ = req.body.Store; break
      case Model.mode.Agent: in_ = req.body.Agent; break
      case Model.mode.Admin: in_ = req.body.Admin; break
      case Model.mode.User : in_ = req.body.User ; break
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