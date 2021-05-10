const { ObjectId }      = require("mongodb")
    , { code, text } 	  = require("../common/error")
    , router 	          = require("express").Router()
    , { Product }       = require("../database/product")

// Add product
router.post("/add", async (req, res, next) => {
  try
  {
    let product = new Product(req.body)
    await product.Add()
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductAdded,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// Read all products
router.get("/list", async (req, res, next) =>
{
  try
  {
    const product = new Product() 
    const data = await product.ReadAll(req.query.StoreID) // TODO
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Read product
router.get("/view", async (req, res, next) =>
{
  try
  {
    let product = new Product()
    const data  = await product.Read(req.query.ProductID) // TODO
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Modify product
router.post("/modify", async (req, res, next) => {
  try
  {
    let product = new Product(req.body)
    await product.Modify(req.body.ProductID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductUpdated,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// Remove a product from product
router.delete("/remove", async (req, res, next) =>
{
  try
  {
    const entry = new Product()
    await entry.Remove(ObjectId(req.body.ProductID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductRemoved,
      Data    : ''
    })
  } catch (err) { next(err) }
})

module.exports = router