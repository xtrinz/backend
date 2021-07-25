const { code, text, status } = require('../../common/error')
    , router 	               = require('express').Router()
    , { Product }            = require('../product/driver')
    , { Store }              = require('../store/driver')
    , db                     = require('../product/archive')

router.post('/add', async (req, res, next) => {
  try
  {
    let store   = new Store()
    await store.Authz(req.body.StoreID, req.body.User._id)

    let product = new Product(req.body)
    await product.Add()
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductAdded,
      Data    : { ProductID: product.Data._id }
    })
  } catch (err) { next(err) }
})

router.get('/list', async (req, res, next) =>
{
  try
  {
    const data = await db.ReadAll(req.query.StoreID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) =>
{
  try
  {
    let product = new Product()
    const data  = await product.Read(req.query.ProductID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.post('/modify', async (req, res, next) => {
  try
  {
    let store   = new Store()
    await store.Authz(req.body.StoreID, req.body.User._id)

    let product = new Product()
    await product.Modify(req.body)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove a product from product
router.delete('/remove', async (req, res, next) =>
{
  try
  {
    let store   = new Store()
    await store.Authz(req.body.StoreID, req.body.User._id)

    await db.Remove(req.body)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router