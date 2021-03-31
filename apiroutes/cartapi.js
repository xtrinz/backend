const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  dataForCartPage,
  addItemToCart,
  deleteCartItem,
} = require("../retrievedatafromdatabase/dataforcart");

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
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { user, shopinfoid, productsid, quantity } = req.body;
    // call function to add item
    await addItemToCart(user, shopinfoid, productsid, quantity);
    // send success response
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Item added to your cart" });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { user, cartitemid } = req.body;
    await deleteCartItem(user, cartitemid);
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "item removed from your cart" });
  } catch (error) {
    next(error);
  }
});
// missing quanity update route

module.exports = router;
