const router     = require('express').Router()
    , Model      = require('../../system/models')
    , journal    = require('../journal/handlers')
    , Transit    = require('../transit/driver')
    , cloudinary = require('cloudinary').v2
    , pub_key    = process.env.CLOUDINARY_KEY
    , sec_key    = process.env.CLOUDINARY_SEC

router.post('/checkout', async (req, res, next) =>
{
  try
  {

    const ret = await journal.Create(req.body)

    if(req.body.IsCOD)
    {
      let transit = new Transit(ret.Journal)
      await transit.Init(ret.Journal.Transit.ID)
    }

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.PaymentInitiated,
      Data    : ret.Response
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
  return res.status(Model.code.OK).json({
    Status  : Model.status.Success,
    Text    : '',
    Data    : data
  })
})

module.exports = router