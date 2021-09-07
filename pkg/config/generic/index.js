const router                 = require('express').Router()
    , { text, code, status } = require('../../system/models')
    , { Journal }            = require('../journal/driver')

// TODO enable rbac
router.get('/search', async (req, res, next) => {
  try
  {
    let text_
    const data_ = []
    if(!data_.length) { text_ = text.NoDataFound}

    return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : data_
      })
  } catch (err) { next(err) }
})

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