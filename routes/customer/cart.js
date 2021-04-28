const express 	= require("express");
const router 	  = express.Router();
const { code } 	= require("../../common/error");
const cart 	    = require("../../database/customer/cart");
const validator = require("../../validators/customer/cart");

// Insert a product to cart
router.post("/", validator.add_cart, async (req, res, next) => {
  try
  {

    await cart.Insert(req.body)
    const msg = "Item added"
    return res.status(code.OK).json({ message: msg })

  } catch (err) { next(err) }
})

// Read all products from a cart
router.get("/", async (req, res, next) =>
{
  try
  {

    const data = await cart.GetAll(req.body.user)
    return res.status(code.OK).json(data)

  } catch (err) { next(err) }
})

// Update a product in cart
router.post("/update", async (req, res, next) => {
  try
  {

    // await cart.Modify(req.body)
    const msg = "Item updated"
    return res.status(code.OK).json({ message: msg })

  } catch (err) { next(err) }
})

// Remove a product from cart
router.delete("/", validator.delete_cart, async (req, res, next) =>
{
  try
  {

    await cart.Remove(req.body)
    const msg = "Item removed"
    return res.status(code.OK).json({ message: msg })

  } catch (err) { next(err) }
})

module.exports = router
