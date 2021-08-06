const { code, text, status } = require('../../common/error')
    , router 	             = require('express').Router()
    , { Journal }            = require('../journal/driver')

router.post('/', async (req, res, next) =>
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