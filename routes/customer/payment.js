const express = require("express");
const code = require("../../error/code");
const { verifySessionToken } = require("../../common/middleware");
const {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
  getDefaultAddress,
  placeOrder,
  calculateOrderAmount,
  createPaymentIntent,
} = require("../../database/customer/payment");
const validator = require("../../validators/customer/payment");

const router = express.Router();

// to get payment page
router.get("/", verifySessionToken, async (req, res, next) => {
  try {
    const { session } = req.body;
    const data = await dataForPaymentPage(session); // Todo : total amount also should be here
    // send data
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", validator.payment_add, async (req, res, next) => {
  try {
    const {
      user,
      isRequestFromCart,
      quantity,
      shopinfoid,
      productsid,
    } = req.body;
    const token = await addTemporaryProductInUserForPaymentPage(
      user,
      isRequestFromCart,
      quantity,
      shopinfoid,
      productsid
    );
    return res.status(code.OK).json({ message: "Succesfully Updated", token });
  } catch (error) {
    next(error);
  }
});

router.get("/location", verifySessionToken, async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = getDefaultAddress(user);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/location", verifySessionToken, async (req, res, next) => {
  try {
    const { user, session, customername, phonenumber, addressid } = req.body;
    // Create a PaymentIntent with the order amount and currency
    await placeOrder(user, session, customername, phonenumber, addressid);
    return res.status(code.OK).json("Success");
  } catch (error) {
    next(error);
  }
});

router.post("/create-payment-intent", verifySessionToken, async (req, res) => {
  try {
    const { user, session } = req.body; //Todo : cleint should send idempotent key also
    // Create a PaymentIntent with the order amount and currency
    const charges = await calculateOrderAmount(session);
    const data = await createPaymentIntent(user, session, charges);
    // Send publishable key and PaymentIntent details to client
    return res.status(code.OK).send(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
