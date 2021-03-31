const express = require("express");
const {
  dataForShopItemPage,
  dataForItemDescriptionPage,
} = require("../retrievedatafromdatabase/shopitem");

const router = express.Router();

router.get("/:shopid", async (req, res, next) => {
  try {
    const { shopid } = req.params;
    const data = await dataForShopItemPage(shopid);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:shopid/item/:itemid", async (req, res, next) => {
  try {
    const { shopid, itemid } = req.params;
    const data = await dataForItemDescriptionPage(shopid, itemid);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
