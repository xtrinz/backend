
const Model       = require('../../system/models')
    , router 	    = require('express').Router()
    , { Journal } = require('../journal/driver')
    , { Transit } = require('../transit/driver')

// Payment status indication
router.post('/payment', async (req, res, next) =>
{
  try
  {
    let   journal    = new Journal()
    const transit_id = await journal.MarkPayment(req)
    
    if(transit_id)
    {
      let transit = new Transit(journal.Data)
      await transit.Init(transit_id)
    }

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Refund status indication
router.post('/refund', async (req, res, next) =>
{
  try
  {

    let   journal = new Journal()
    await journal.MarkRefund(req)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router