const express = require("express");
const {
  dataForSearchResultPage,
} = require("../retrievedatafromdatabase/searchresult");

const router = express.Router();

router.get("/", async (req, res, next) => {
  let { searchresult } = req.query;
  searchresult = searchresult.toLowerCase().trim();
  const data = await dataForSearchResultPage(searchresult);
  return res.json(data);
});

module.exports = router;
