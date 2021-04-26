const express = require("express");
const { code } = require("../../common/error");
const {
  dataForOrderHistory,
  dataForOrderStatusPage,
} = require("../../database/customer/orderhistory");
const validator = require("../../validators/customer/orderhistory");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { user } = req.body;
    const data = await dataForOrderHistory(user);
    // send response
    return res.status(code.OK).json(data);
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
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
