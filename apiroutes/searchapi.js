const express = require("express");
const {
  dataForSearchResultPage,
} = require("../retrievedatafromdatabase/searchresult");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let { searchresult } = req.query;
    searchresult = searchresult.toLowerCase().trim();
    const data = await dataForSearchResultPage(searchresult);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
