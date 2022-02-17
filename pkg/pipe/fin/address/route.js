const router 	= require('express').Router()
    , Model   = require('../../../sys/models')
    , Address = require('./model')
    , addr    = require('./driver')

// Add address
router.post('/add', async (req, res, next) => {
  try
  {
    const entry = new Address(req.body)
        , Id    = await addr.Insert(entry)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.AddressAdded,
      Data    : { AddressID: Id }
    })
  } catch (err) { next(err) }
})

// Read addresss
router.get('/view', async (req, res, next) =>
{
  try
  {
    req.query.ClientID  = req.body.Client._id
    const data        = await addr.Read(req.query)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// List addresss
router.get('/list', async (req, res, next) =>
{
  try
  {
    const data = await addr.List(req.body.Client._id)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Modify address
router.put('/modify', async (req, res, next) => {
  try
  {
    await addr.Update(req.body)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.AddressUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove address
router.delete('/remove', async (req, res, next) =>
{
  try
  {
    await addr.Remove( req.body.Client._id,
                        req.body.AddressID)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.AddressRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router