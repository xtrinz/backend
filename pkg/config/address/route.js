const { Address }            = require('../address/driver')
    , router 	               = require('express').Router()
    , { code, status, text } = require('../../common/error')

// Add address
router.post('/add', async (req, res, next) => {
  try
  {
    const entry = new Address(req.body)
        , Id    = await entry.Insert(req.body.User._id)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressAdded,
      Data    : { AddressID: Id }
    })
  } catch (err) { next(err) }
})

// Read addresss
router.get('/view', async (req, res, next) =>
{
  try
  {
    const address     = new Address()
    req.query.UserID  = req.body.User._id
    const data        = await address.Read(req.query)

    return res.status(code.OK).json({
      Status  : status.Success,
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
    const address = new Address()
        , data    = await address.List(req.body.User._id)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Modify address
router.post('/modify', async (req, res, next) => {
  try
  {
    const entry = new Address()
    await entry.Update(req.body)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove address
router.delete('/remove', async (req, res, next) =>
{
  try
  {
    const entry = new Address()
    await entry.Remove( req.body.User._id,
                        req.body.AddressID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router