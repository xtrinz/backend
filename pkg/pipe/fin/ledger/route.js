const router 	= require('express').Router()
    , Model   = require('../../../sys/models')
    , ledger  = require('./driver')

// Read Ledger
router.get('/view', async (req, res, next) =>
{
  try
  {

    // const data = await ledger.Read(req.query)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : ''// data
    })
  } catch (err) { next(err) }
})

// List Ledger
router.get('/list', async (req, res, next) =>
{
  try
  {

    // const data = await ledger.List(req.query)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : ''// data
    })
  } catch (err) { next(err) }
})

module.exports = router