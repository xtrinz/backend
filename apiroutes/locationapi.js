const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const {
  addLocationToDatabase,
  makeAddressFavourite,
  removeAddress,
  editAddress,
  getAllAddresses,
  getAddress,
} = require("../retrievedatafromdatabase/location");

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const { user } = req.body;
    const data = getAllAddresses(user);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:addressid", (req, res, next) => {
  try {
    const { user } = req.body;
    const { addressid } = req.params;
    const data = getAddress(user, addressid);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * it set user location
 */
router.post("/", async (req, res, next) => {
  try {
    let {
      user,
      lat,
      lng,
      house,
      street,
      landmark,
      town,
      state,
      country,
      pincode,
      isdefault = false,
      isfavourite = false,
    } = req.body;
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    // add user location to database
    const addressId = await addLocationToDatabase(
      user,
      lat,
      lng,
      house,
      street,
      landmark,
      town,
      state,
      country,
      pincode,
      isdefault,
      isfavourite
    );
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Address added success fully", addressId });
  } catch (error) {
    next(error);
  }
});

router.post("/fav", async (req, res, next) => {
  try {
    const { user, addressid, isfavourite } = req.body;
    await makeAddressFavourite(user, addressid, isfavourite);
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Success Fully Updated" });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { user, addressid } = req.body;
    await removeAddress(user, addressid);
    return res.status(httpStatusCodes.OK).json({ message: "Address removed" });
  } catch (error) {
    next(error);
  }
});

router.post("/edit", async (req, res, next) => {
  try {
    let {
      user,
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
      user,
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
    return res
      .status(httpStatusCodes.OK)
      .json({ message: "Address success fully updated" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
