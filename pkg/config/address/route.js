const { Address }            = require('../address/driver')
    , router 	               = require('express').Router()
    , { code, status, text } = require('../../system/models')

// Add address
router.post('/add', async (req, res, next) => {
  try
  {
    const entry = new Address(req.body)
        , Id    = await entry.Insert(req.body.User._id
                        , req.body.User.AddressList)
    
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
    req.query.UserID  = req.body.User._id
    const data        = await Address.Read(req.query)

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
    const data = await Address.List(req.body.User._id)

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
    await Address.Update(req.body)
    
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
    await Address.Remove( req.body.User._id,
                        req.body.AddressID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router