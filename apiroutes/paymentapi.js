const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
  getDefaultAddress,
} = require("../retrievedatafromdatabase/payment");

const router = express.Router();

// to get payment page
router.get("/", async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = await dataForPaymentPage(user);
    // send data
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      user,
      isRequestFromCart,
      quantity,
      shopinfoid,
      productsid,
    } = req.body;
    await addTemporaryProductInUserForPaymentPage(
      user,
      isRequestFromCart,
      quantity,
      shopinfoid,
      productsid
    );
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Succesfully Updated" });
  } catch (error) {
    next(error);
  }
});

router.get("/location", async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = getDefaultAddress(user);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/location", async (req, res, next) => {
  try {
    const { user, customername, phonenumber, addressid } = req.body;
    await tempStoreDelDetails(user, customername, phonenumber, addressid);
    return res.status(httpStatusCodes.OK).json("Success");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
