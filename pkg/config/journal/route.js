const { code, status } = require('../../common/error')
    , router 	         = require('express').Router()
    , { Journal }      = require('./driver')

// List Journals
router.get('/list', async (req, res, next) =>
{
  try
  {
    const journal = new Journal()
        , data    = await journal.List(req.query
                          , req.body.User)
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// View Journal
router.get('/view', async (req, res, next) =>
{
  try
  {
    const journal = new Journal()
        , data    = await journal.Read(req.query
                              , req.body.User)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router