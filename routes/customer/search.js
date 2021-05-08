const express                     = require("express")
const { dataForSearchResultPage } = require("../../database/customer/searchresult")
const validator                   = require("../../validators/customer/search")
const router                      = express.Router()

router.get("/", validator.search_res, async (req, res, next) => {
  try
  {
    let { searchresult } = req.query;
    searchresult = searchresult.toLowerCase().trim();
    const data = await dataForSearchResultPage(searchresult);
    return res.status(code.OK).json(data);
  } catch (err) { next(err) }
})

module.exports = router