const express = require("express");
const httpStatusCodes = require("../error/httpstatuscode");
const { dataForHomePage } = require("../retrievedatafromdatabase/dataforhome");
// creating router object
const router = express.Router();
// route to get data for home page
// add token verification (if required)
// wrap code inside of this (data collecting from database) to function so that two server can just point to that function to retrieve data
router.get("/page/:pageno", async (req, res, next) => {
  try {
    let { pageno } = req.params;
    pageno = parseInt(pageno);
    const data = await dataForHomePage(pageno);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
