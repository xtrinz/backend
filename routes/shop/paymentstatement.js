const {
  getPaymentStatement,
  getPendingPaymentStatement,
  getSuccessPaymentStatement,
} = require("../../database/shop/paymentstatement");
const { code } = require("../../common/error");

const router = require("express").Router();

// full payment statement
router.get("/", async (req, res, next) => {
  try {
    const { shopinfoid } = req.query;
    const data = await getPaymentStatement(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// pending statement
router.get("/p", async (req, res, next) => {
  try {
    const { shopinfoid } = req.query;
    const data = await getPendingPaymentStatement(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});
// success statement
router.get("/s", async (req, res, next) => {
  try {
    const { shopinfoid } = req.query;
    const data = await getSuccessPaymentStatement(shopinfoid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
