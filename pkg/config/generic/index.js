const router      = require('express').Router()
    , { text
    ,   code
    ,   status }  = require('../../system/models')
    , { Journal } = require('../journal/driver')
    , cloudinary  = require('cloudinary').v2
    , pub_key     = process.env.CLOUDINARY_KEY
    , sec_key     = process.env.CLOUDINARY_SEC

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

router.get("/cloudinary", async (req, res, next) =>
{
  const sign = await cloudinary.utils.api_sign_request(req.query, sec_key)
      , data =
  {
      Time : Date.now()
    , Sign : sign
    , Key  : pub_key
  }
  return res.status(code.OK).json({
    Status  : status.Success,
    Text    : '',
    Data    : data
  })
})

module.exports = router