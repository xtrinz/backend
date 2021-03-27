const express = require("express");
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
  const { userid } = req.body;
  // getting data for cart page
  const data = await dataForCartPage(userid);
  // send response
  return res.json(data);
});

router.post("/", async (req, res, next) => {
  const { userid, shopinfoid, productsid, quantity } = req.body;
  // call function to add item
  await addItemToCart(userid, shopinfoid, productsid, quantity);
  // send success response
  return res.json({ message: "Updated Succesfully" });
});

router.delete("/", async (req, res, next) => {
  const { userid, cartitemid } = req.body;
  await deleteCartItem(userid, cartitemid);
  return res.json({ message: "Updated Succesfully" });
});

module.exports = router;
