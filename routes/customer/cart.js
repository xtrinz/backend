const express = require("express");
const { code } = require("../../common/error");
const {
  dataForCartPage,
  addItemToCart,
  deleteCartItem,
} = require("../../database/customer/cart");
const validator = require("../../validators/customer/cart");

const router = express.Router();

/**
 * this api return cart data
 */
router.get("/", async (req, res, next) => {
  try {
    const { user } = req.body;
    // getting data for cart page
    const data = await dataForCartPage(user);
    // send response
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", validator.add_cart, async (req, res, next) => {
  try {
    const { user, shopinfoid, productsid, quantity } = req.body;
    // call function to add item
    await addItemToCart(user, shopinfoid, productsid, quantity);
    // send success response
    return res.status(code.OK).json({ message: "Item added to your cart" });
  } catch (error) {
    next(error);
  }
});

router.delete("/", validator.delete_cart, async (req, res, next) => {
  try {
    const { user, cartitemid } = req.body;
    await deleteCartItem(user, cartitemid);
    return res.status(code.OK).json({ message: "item removed from your cart" });
  } catch (error) {
    next(error);
  }
});
// missing quanity update route

module.exports = router;
