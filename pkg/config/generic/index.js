const router      = require('express').Router()
    , { text
    ,   code
    ,   status }  = require('../../system/models')
    , { Journal } = require('../journal/driver')
    , { Transit } = require('../transit/driver')
    , cloudinary  = require('cloudinary').v2
    , pub_key     = process.env.CLOUDINARY_KEY
    , sec_key     = process.env.CLOUDINARY_SEC

router.post('/checkout', async (req, res, next) =>
{
  try
  {

    const journal = new Journal() 
        , data    = await journal.New(req.body)

    if(req.body.IsCOD)
    {
      let transit = new Transit(journal.Data)
      await transit.Init(journal.Transit.ID)
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.PaymentInitiated,
      Data    : data
    })
  } catch (err) { next(err) }
})

router.post("/cloudinary", async (req, res, next) =>
{
  const now           = new Date()
      , ts            = Math.round(now.getTime()/1000)

  req.query.timestamp = ts

  const sign = await cloudinary.utils.api_sign_request(req.query, sec_key)
      , data =
  {
      Time : ts
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