const Model       = require('../../system/models')
    , router 	    = require('express').Router()
    , { Journal } = require('./driver')

// List Journals
router.get('/list', async (req, res, next) =>
{
  try
  {
    let in_
    switch (req.body.Mode) {
      case Model.mode.Store: in_ = req.body.Store; break
      case Model.mode.Agent: in_ = req.body.Agent; break
      default: in_ = req.body.User;          break
    }
    const journal = new Journal()
        , data    = await journal.List(req.query, in_, req.body.Mode)
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
    switch (req.body.Mode) {
      case Model.mode.Store: in_ = req.body.Store; break
      case Model.mode.Agent: in_ = req.body.Agent; break
      default: in_ = req.body.User;          break
    }    
    const journal = new Journal()
        , data    = await journal.Read(req.query, in_, req.body.Mode)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router