const httpStatusCodes = require("../error/httpstatuscode");
const {
  createShop,
  verificationstatus,
} = require("../retrievedatafromdatabase/createshop");

const router = require("express").Router();

router.post("/create", async (req, res, next) => {
  const {
    user,
    shopname,
    location,
    brandname,
    shoptype,
    certificates,
    contactdetails,
  } = req.body;

  await createShop(
    user,
    shopname,
    location,
    brandname,
    shoptype,
    certificates,
    contactdetails
  );
  return res.status(httpStatusCodes.OK).json("Success");
});

router.get("/status", async (req, res) => {
  const { user } = req.body;
  const data = await verificationstatus(user);
  return res.status(httpStatusCodes.OK).json(data);
});

module.exports = router;
