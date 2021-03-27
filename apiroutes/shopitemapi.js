const express = require("express");
const {
  dataForShopItemPage,
  dataForItemDescriptionPage,
} = require("../retrievedatafromdatabase/shopitem");

const router = express.Router();

router.get("/:shopid", async (req, res, next) => {
  const { shopid } = req.params;
  const data = await dataForShopItemPage(shopid);
  return res.json(data);
});

router.get("/:shopid/item/:itemid", async (req, res, next) => {
  const { shopid, itemid } = req.params;
  const data = await dataForItemDescriptionPage(shopid, itemid);
  return res.json(data);
});

module.exports = router;
