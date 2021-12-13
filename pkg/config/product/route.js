const Model   = require('../../system/models')
    , router 	= require('express').Router()
    , Product = require('../product/model')
    , Method  = require('../product/methods')
    , db      = require('../product/archive')

router.post('/add', async (req, res, next) => {
  try
  {

    let product = new Product(req.body)
    await Method.Add(product)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductAdded,
      Data    : { ProductID: product._id }
    })
  } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) =>
{
  try
  {

    const data  = await Method.Read(req.query.ProductID, req.body)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.get('/list', async (req, res, next) =>
{
  try
  {

    const data  = await Method.List(req.query, req.body)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.post('/modify', async (req, res, next) => {
  try
  {

    await Method.Modify(req.body)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove a product from product
router.delete('/remove', async (req, res, next) =>
{
  try
  {

    await db.Remove(req.body)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router