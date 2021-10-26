const { Note }               = require('../note/driver')
    , router 	             = require('express').Router()
    , { code, status, text } = require('../../system/models')

// Set note
router.post('/set', async (req, res, next) => {
    try
    {
      await Note.Set(req.body)
      
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text.NoteSet,
        Data    : {}
      })
    } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) =>
{
  try
  {
    const data = await Note.Read(req.query.Type)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router