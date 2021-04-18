const express = require("express");
const { paymentStatus } = require("../../database/stripe/webhook");
const router = express.Router();

router.post("/", async (req, res) => {
  let { data, eventType } = req.body;
  const { rawBody } = req;
  let signature = req.headers["stripe-signature"];
  await paymentStatus(rawBody, data, eventType, signature);
  res.sendStatus(200);
});

module.exports = router;