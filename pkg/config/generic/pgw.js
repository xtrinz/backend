
const Model   = require('../../system/models')
    , router 	= require('express').Router()
    , journal = require('../journal/handlers')
    , Transit = require('../transit/driver')

// Payment status indication
router.post('/payment', async (req, res, next) =>
{
  try
  {
    const rcd = await journal.MarkPayment(req)
    
    if(rcd.Payment.Status = Model.states.Success)
    {
      let transit = new Transit(rcd)
      await transit.Init(rcd.Transit.ID)
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

    await journal.MarkRefund(req)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router