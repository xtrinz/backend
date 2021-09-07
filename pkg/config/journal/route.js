const { code, status } = require('../../system/models')
    ,  { mode }        = require('../../system/models')
    , router 	         = require('express').Router()
    , { Journal }      = require('./driver')

// List Journals
router.get('/list', async (req, res, next) =>
{
  try
  {
    const in_     = (req.body.Mode === mode.Store)? req.body.Store: req.body.User
        , journal = new Journal()
        , data    = await journal.List(req.query, in_, req.body.Mode)
    return res.status(code.OK).json({
      Status  : status.Success,
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
    const in_     = (req.body.Mode === mode.Store)? req.body.Store: req.body.User    
        , journal = new Journal()
        , data    = await journal.Read(req.query, in_, req.body.Mode)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router