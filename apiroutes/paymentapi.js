const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  dataForPaymentPage,
  addTemporaryProductInUserForPaymentPage,
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

module.exports = router;
