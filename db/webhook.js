require("dotenv").config();
const { ObjectId } = require("mongodb");
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripeSecretKey);
const {
  purchaseHistoryCollection,
} = require("./connect");

const paymentStatus = async function (rawBody, data, eventType, signature) {
  // Check if webhook signing is configured.
  // Retrieve the event by verifying the signature using the raw body and secret.
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    console.log(" Webhook signature verification failed.");
    return res.sendStatus(400);
  }
  data = event.data;
  eventType = event.type;
  const paymentintent = data.object;
  const sessionid = paymentintent.metadata.sessionid;
  const userid = paymentintent.metadata.userid;
  const purchaseid = paymentintent.metadata.purchaseid;
  const query = {
    purchaseid: ObjectId(purchaseid),
    userid: ObjectId(userid),
  };
  let options;
  if (eventType === "payment_intent.succeeded") {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log(" Payment captured!");

    options = {
      $set: {
        paymentstatus: "payment succeeded",
      },
    };
    await purchaseHistoryCollection.updateOne(query, options);
  } else if (eventType === "payment_intent.payment_failed") {
    console.log(" Payment failed.");
    options = {
      $set: {
        paymentstatus: "payment failed",
      },
    };
  }
};

module.exports = {
  paymentStatus,
};
