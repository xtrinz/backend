const { ObjectId }           = require("mongodb")
    , { code, text, status } = require("../common/error")
    , {Cart, CartEntry}      = require("../objects/cart")
    , router 	               = require("express").Router()

// Insert product
router.post("/insert", async (req, res, next) => {
  try
  {
    const entry = new CartEntry(req.body)
    await entry.Insert(req.body.User.CartID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductAdded,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// List products
router.get("/list", async (req, res, next) =>
{
  try
  {
    const cart = new Cart()
    const data = await cart.Read(req.body.User._id)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Update product
router.post("/modify", async (req, res, next) => {
  try
  {
    const entry = new CartEntry()
    await entry.Update( ObjectId(req.body.User.CartID),
                        ObjectId(req.body.ProductID),
                        req.body.Quantity)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove product
router.delete("/remove", async (req, res, next) =>
{
  try
  {
    const entry = new CartEntry()
    await entry.Remove( ObjectId(req.body.User.CartID),
                        ObjectId(req.body.ProductID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router
