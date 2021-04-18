const {
  getPaymentStatement,
  getPendingPaymentStatement,
  getSuccessPaymentStatement,
} = require("../../database/shop/paymentstatement");
const code = require("../../error/code");

const router = require("express").Router();

router.get("/", async (req, res, next) => {
  const { shopinfoid } = req.query;
  const data = await getPaymentStatement(shopinfoid);
  return res.status(code.OK).json(data);
});

router.get("/p", async (req, res, next) => {
  const { shopinfoid } = req.query;
  const data = await getPendingPaymentStatement(shopinfoid);
  return res.status(code.OK).json(data);
});

router.get("/s", async (req, res, next) => {
  const { shopinfoid } = req.query;
  const data = await getSuccessPaymentStatement(shopinfoid);
  return res.status(code.OK).json(data);
});

module.exports = router;
