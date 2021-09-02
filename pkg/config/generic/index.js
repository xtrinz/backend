const router                 = require('express').Router()
    , { text, code, status } = require('../../common/error')

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

module.exports = router