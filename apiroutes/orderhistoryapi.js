const express = require("express");
const {
  dataForOrderHistory,
  placeOrderAddDataToOrderHistory,
  dataForOrderStatusPage,
} = require("../retrievedatafromdatabase/orderhistory");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { userid } = req.body;
  const data = await dataForOrderHistory(userid);
  // send response
  return res.json(data);
});

router.post("/", async (req, res, next) => {
  // retrieve incoming info
  let { userid, customername, phonenumber, lat, lng } = req.body;
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  const purchaseid = await placeOrderAddDataToOrderHistory(
    userid,
    customername,
    phonenumber,
    lat,
    lng
  );
  // send success message
  return res.json({ message: "Successfully Updated", purchaseid: purchaseid });
});

router.get("/:purchaseId", async (req, res, next) => {
  const { userid } = req.body;
  const { purchaseId } = req.params;
  const data = await dataForOrderStatusPage(userid, purchaseId);
  // send response
  return res.json(data);
});

module.exports = router;
