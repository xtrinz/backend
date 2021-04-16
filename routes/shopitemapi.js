const express = require("express");
const {
  dataForShopItemPage,
  dataForItemDescriptionPage,
} = require("../database/shopitem");
const validator = require("../validators/shopitem");

const router = express.Router();

router.get("/:shopid", validator.get_shop, async (req, res, next) => {
  try {
    const { shopid } = req.params;
    const data = await dataForShopItemPage(shopid);
    return res.status(code.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:shopid/item/:itemid",
  validator.get_item,
  async (req, res, next) => {
    try {
      const { shopid, itemid } = req.params;
      const data = await dataForItemDescriptionPage(shopid, itemid);
      return res.status(code.OK).json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
