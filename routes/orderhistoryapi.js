const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  dataForOrderHistory,
  dataForOrderStatusPage,
} = require("../database/orderhistory");
const validator = require("../validators/orderhistory");

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

router.get("/:purchaseId", validator.order_status, async (req, res, next) => {
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
