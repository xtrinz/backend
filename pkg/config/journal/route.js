const { code, status } = require('../../common/error')
    , router 	         = require('express').Router()
    , db               = require('../journal/archive')

// List Journals (user/shop)
router.get('/list', async (req, res, next) =>
{
  try
  {
    const data    = await db.List(req.query) // TODO
    /*
    {
      type: 'user/shop'
      id  : 'user_id/shop_id'
      opt : 'success/processing...'
    }*/    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Journals (user/shop)
router.get('/read', async (req, res, next) =>
{
  try
  {
    const data    = await db.List(req.query) // TODO
    /*
    {
      type: 'user/shop'
      id  : 'user_id/shop_id'
      opt : 'success/processing...'
    }*/
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router