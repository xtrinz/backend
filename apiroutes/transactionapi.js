const express = require("express");
const { calculateOrderAmount } = require("../retrievedatafromdatabase/payment");
const {
  createPaymentIntent,
  paymentStatus,
} = require("../retrievedatafromdatabase/transaction");
const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  const { user, session } = req.body; //Todo : cleint should send idempotent key also
  // Create a PaymentIntent with the order amount and currency
  const charges = await calculateOrderAmount(session);
  const data = await createPaymentIntent(user, session, charges);
  // Send publishable key and PaymentIntent details to client
  return res.status(httpStatusCodes.OK).send(data);
});

router.post("/webhook", async (req, res) => {
  let { data, eventType } = req.body;
  const { rawBody } = req;
  let signature = req.headers["stripe-signature"];
  await paymentStatus(rawBody, data, eventType, signature);
  res.sendStatus(200);
});

module.exports = router;
