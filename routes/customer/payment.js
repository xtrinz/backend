const express = require("express");
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

const { ObjectId }                  = require("mongodb")
const { sessions }                  = require("../../database/connect")
const { Err, code, status, reason } = require("./../common/error")
const jwt                           = require("jsonwebtoken")
const session_secret                = process.env.JWT_SESSION_TOKEN_SECRET;

const verifySessionToken = async function (req, res, next) {
  try
  {
    let token = req.headers["x-access-token"];
    if (!token) 
    {
      const   code_       = code.BAD_REQUEST
            , status_     = status.Failed
            , reason_     = reason.TokenMissing
      throw new Err(code_, status_, reason_)
    }

    const decoded = jwt.verify(token, session_secret)
    const query =
    {
      _id     : ObjectId(decoded._id),
      userid  : ObjectId(req.body.user._id)
    }

    const session = await sessions.findOne(query);
    if (!session)
    {
      const   code_       = code.BAD_REQUEST
            , status_     = status.Failed
            , reason_     = 'Session not found'
      throw new Err(code_, status_, reason_)
    }

    req.body.session = session;
    next();
  } catch (error) { next(error) }
}

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

// Todo : we should handle cash on delivery

module.exports = router;
