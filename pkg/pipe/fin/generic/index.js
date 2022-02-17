const router     = require('express').Router()
    , Model      = require('../../../sys/models')
    , cloudinary = require('cloudinary').v2
    , pub_key    = process.env.CLOUDINARY_KEY
    , sec_key    = process.env.CLOUDINARY_SEC

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