const express = require("express");
const {
  addLocationToDatabase,
  makeAddressFavourite,
  removeAddress,
  editAddress,
  getAllAddresses,
  getAddress,
} = require("../retrievedatafromdatabase/location");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { userid } = req.body;
  const data = await getAllAddresses(userid);
  return res.json(data);
});

router.get("/:addressid", async (req, res, next) => {
  const { userid } = req.body;
  const { addressid } = req.params;
  const data = await getAddress(userid, addressid);
  return res.json(data);
});

/**
 * it set user location
 */
router.post("/", async (req, res, next) => {
  let {
    userid,
    lat,
    lng,
    house,
    street,
    landmark,
    town,
    state,
    country,
    pincode,
  } = req.body;
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  // add user location to database
  await addLocationToDatabase(
    userid,
    lat,
    lng,
    house,
    street,
    landmark,
    town,
    state,
    country,
    pincode
  );
  return res.json({ message: "Success Fully Updated" });
});

router.post("/fav", async (req, res, next) => {
  const { userid, addressid, isfavourite } = req.body;
  await makeAddressFavourite(userid, addressid, isfavourite);
  return res.json({ message: "Success Fully Updated" });
});

router.delete("/", async (req, res, next) => {
  const { userid, addressid } = req.body;
  await removeAddress(userid, addressid);
  return res.json({ message: "Success Fully Updated" });
});

router.post("/edit", async (req, res, next) => {
  let {
    userid,
    addressid,
    lat,
    lng,
    house,
    street,
    landmark,
    town,
    state,
    country,
    pincode,
  } = req.body;
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  await editAddress(
    userid,
    addressid,
    lat,
    lng,
    house,
    street,
    landmark,
    town,
    state,
    country,
    pincode
  );
  return res.json({ message: "Success Fully Updated" });
});

module.exports = router;
