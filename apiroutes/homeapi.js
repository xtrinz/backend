const express = require("express");
const { dataForHomePage } = require("../retrievedatafromdatabase/dataforhome");
// creating router object
const router = express.Router();
// route to get data for home page
// add token verification (if required)
// wrap code inside of this (data collecting from database) to function so that two server can just point to that function to retrieve data
router.get("/page/:pageno", async (req, res, next) => {
  let { pageno } = req.params;
  pageno = parseInt(pageno);
  const data = await dataForHomePage(pageno);
  return res.json(data);
});

module.exports = router;
