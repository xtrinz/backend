const { code } = require("../../common/error");
const {
  createShop,
  verificationstatus,
} = require("../../database/shop/createshop");

const router = require("express").Router();

router.post("/create", async (req, res, next) => {
  try {
    const {
      user,
      shopname,
      shopimage,
      location,
      brandname,
      shoptype,
      certificates,
      contactdetails,
    } = req.body;

    await createShop(
      user,
      shopname,
      shopimage,
      location,
      brandname,
      shoptype,
      certificates,
      contactdetails
    );
    return res.status(code.ACCEPTED).json("Success");
  } catch (error) {
    next(error);
  }
});

router.get("/status", async (req, res) => {
  try {
    const { user } = req.body;
    const data = await verificationstatus(user);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
