const {
  dataForShopOrderHistory,
  dataForOrderStatusPage,
} = require("../../database/shop/shoporderhistory");
const code = require("../../error/code");

const router = require("express").Router();

router.get("/:shopinfoid", async (req, res, next) => {
  const { shopinfoid } = req.params;
  const data = await dataForShopOrderHistory(shopinfoid);
  return res.status(code.OK).json(data);
});

router.get("/:shopinfoid/:orderid", async (req, res, next) => {
  const { shopinfoid, orderid } = req.params;
  const data = await dataForOrderStatusPage(shopinfoid, orderid);
  return res.status(code.OK).json(data);
});

module.exports = router;
