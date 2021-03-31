const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  dataForOrderHistory,
  placeOrderAddDataToOrderHistory,
  dataForOrderStatusPage,
} = require("../retrievedatafromdatabase/orderhistory");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = await dataForOrderHistory(user);
    // send response
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { user, customername, phonenumber, addressid } = req.body;
    const purchaseid = await placeOrderAddDataToOrderHistory(
      user,
      customername,
      phonenumber,
      addressid
    );
    // send success message
    return res.status(httpStatusCodes.OK).json({
      message: "Order placed success fully",
      purchaseid: purchaseid,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:purchaseId", async (req, res, next) => {
  try {
    const { user } = req.body;
    const { purchaseId } = req.params;
    const data = await dataForOrderStatusPage(user, purchaseId);
    // send response
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
