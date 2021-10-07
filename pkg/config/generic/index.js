const router        = require('express').Router()
    , { text
    ,   code
    ,   status }    = require('../../system/models')
    , { Journal }   = require('../journal/driver')

router.post('/checkout', async (req, res, next) =>
{
  try
  {

    const journal = new Journal() 
        , data    = await journal.New(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.PaymentInitiated,
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router