const { code, status } = require('../../common/error')
    , { states }       = require('../../common/models')
    , router 	       = require('express').Router()
    , { Journal }      = require('../journal/driver')
    , { Transit }      = require('../transit/driver')
    , db               = require('../journal/archive')

// Payment status indication
router.post('/payment', async (req, res, next) =>
{
  try
  {
    let   journal = new Journal()
    const status_ = await journal.UpdateStatus(req)
    if (status_ === states.StripeSucess)
    {
      let transit = new Transit(journal.Data)
      await transit.Init()
      journal.Data.Transit.ID = transit.Data._id
    }
    await db.Save(journal.Data)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Refund status indication
router.post('/refund', async (req, res, next) =>
{
  try
  {
    let   journal = new Journal()
    const status_ = await journal.UpdateStatus(req)
    /*if (status_ === states.StripeSucess)
    {
      let transit = new Transit(journal.Data)
      await transit.Init()
      journal.Data.Transit.ID = transit.Data._id
    }*/
    await db.Save(journal.Data)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router