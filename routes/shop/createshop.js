const code = require("../../error/code");
const {
  createShop,
  verificationstatus,
} = require("../../database/shop/createshop");

const router = require("express").Router();

router.post("/create", async (req, res, next) => {
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
  return res.status(code.OK).json("Success");
});

router.get("/status", async (req, res) => {
  const { user } = req.body;
  const data = await verificationstatus(user);
  return res.status(code.OK).json(data);
});

module.exports = router;
