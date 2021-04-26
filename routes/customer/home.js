const express = require("express");
const { code } = require("../../common/error");
const { dataForHomePage } = require("../../database/customer/home");
const validator = require("../../validators/customer/home");
// creating router object
const router = express.Router();
// route to get data for home page
// add token verification (if required)
// wrap code inside of this (data collecting from database) to function so that two server can just point to that function to retrieve data
router.get("/page/:pageno", validator.validate_home, async (req, res, next) => {
  try {
    let { pageno } = req.params;
    let { lattitude, longitude } = req.query;
    pageno = parseInt(pageno);
    lat = parseFloat(lattitude);
    lon = parseFloat(longitude);
    const data = await dataForHomePage(pageno, lon, lat);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
