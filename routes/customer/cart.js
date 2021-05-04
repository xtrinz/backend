const express 	        = require("express");
const router 	          = express.Router();
const { code, text } 	  = require("../../common/error");
const {Cart, CartEntry} = require("../../database/cart");
const { ObjectId }      = require("mongodb")
const validator         = require("../../validators/customer/cart");

// Insert product
router.post("/insert", validator.add_cart, async (req, res, next) => {
  try
  {
    const entry = new CartEntry(req.body)
    await entry.Insert(req.body.CartID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductAdded,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// List products
router.get("/list", async (req, res, next) =>
{
  try
  {
    const cart = new Cart() 
    const data = await cart.Read(req.query.CardID) // TODO
    
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
    await entry.Update( ObjectId(req.body.CartID),
                        ObjectId(req.body.EntryID),
                        req.body.Quantity)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductUpdated,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// Remove product
router.delete("/remove", validator.delete_cart, async (req, res, next) =>
{
  try
  {
    const entry = new CartEntry()
    await entry.Remove( ObjectId(req.body.CartID),
                        ObjectId(req.body.EntryID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductRemoved,
      Data    : ''
    })
  } catch (err) { next(err) }
})

module.exports = router
