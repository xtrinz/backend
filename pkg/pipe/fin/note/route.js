const { Note } = require('../note/driver')
    , router 	 = require('express').Router()
    , Model    = require('../../../sys/models')

// Set note
router.post('/set', async (req, res, next) => {
    try
    {
      await Note.Set(req.body)
      
      return res.status(Model.code.OK).json({
        Status  : Model.status.Success,
        Text    : Model.text.NoteSet,
        Data    : {}
      })
    } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) =>
{
  try
  {
    const data = await Note.Read(req.query.Type)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router