const { code, status } = require('../../system/models')
    , router 	         = require('express').Router()

router.post('/store', async (req, res, next) =>
{
    try
    {
      let event_, text_
      switch(req.body.Task)
      {
        case task.Reject: event_; text_;
          break

        case task.Accept: event_; text_;
          break

        case task.Despatch: event_; text_;
          break
      }

      return res.status(code.OK).json({
          Status  : status.Success,
          Text    : text_,
          Data    : {}
      })
    } catch (err) { next(err) }
})

router.post('/user', async (req, res, next) =>
{
    try
    {
      let event_, text_
      switch(req.body.Task)
      {
        case task.Reject: event_; text_;
          break

        case task.Accept: event_; text_;
          break

        case task.Despatch: event_; text_;
          break
      }

      return res.status(code.OK).json({
          Status  : status.Success,
          Text    : text_,
          Data    : {}
      })
    } catch (err) { next(err) }
})

router.post('/agent', async (req, res, next) =>
{
    try
    {
      let event_, text_
      switch(req.body.Task)
      {
        case task.Reject: event_; text_;
          break

        case task.Accept: event_; text_;
          break

        case task.Despatch: event_; text_;
          break
      }

      return res.status(code.OK).json({
          Status  : status.Success,
          Text    : text_,
          Data    : {}
      })
    } catch (err) { next(err) }
})

router.post('/admin', async (req, res, next) =>
{
    try
    {
      let event_, text_
      switch(req.body.Task)
      {
        case task.Reject: event_; text_;
          break

        case task.Accept: event_; text_;
          break

        case task.Despatch: event_; text_;
          break
      }

      return res.status(code.OK).json({
          Status  : status.Success,
          Text    : text_,
          Data    : {}
      })
    } catch (err) { next(err) }
})

// List Channel
router.get('/list', async (req, res, next) =>
{
  try
  {
    const data    = {}
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// View Channel
router.get('/view', async (req, res, next) =>
{
  try
  {
    const data    = {}

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router