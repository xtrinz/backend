const {
  dataForShopOrderHistory,
  dataForOrderStatusPage,
} = require("../../database/shop/shoporderhistory");
const code = require("../../error/code");

const router = require("express").Router();

router.get("/:shopinfoid", async (req, res, next) => {
  try {
    const { shopinfoid } = req.params;
    const data = await dataForShopOrderHistory(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:shopinfoid/:orderid", async (req, res, next) => {
  try {
    const { shopinfoid, orderid } = req.params;
    const data = await dataForOrderStatusPage(shopinfoid, orderid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
