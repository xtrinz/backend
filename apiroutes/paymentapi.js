const express = require("express");
const {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
} = require("../retrievedatafromdatabase/payment");

const router = express.Router();

// to get payment page
router.get("/", async (req, res, next) => {
  const { userid } = req.body;
  const data = await dataForPaymentPage(userid);
  // send data
  return res.json(data);
});

router.post("/", async (req, res, next) => {
  const {
    userid,
    isRequestFromCart,
    quantity,
    shopinfoid,
    productsid,
  } = req.body;
  await addTemporaryProductInUserForPaymentPage(
    userid,
    isRequestFromCart,
    quantity,
    shopinfoid,
    productsid
  );
  return res.json({ message: "Succesfully Updated" });
});

module.exports = router;
