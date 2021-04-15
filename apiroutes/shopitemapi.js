const express = require("express");
const {
  dataForShopItemPage,
  dataForItemDescriptionPage,
} = require("../retrievedatafromdatabase/shopitem");
const validator = require("../validators/shopitem");

const router = express.Router();

router.get("/:shopinfoid", validator.get_shop, async (req, res, next) => {
  try {
    const { shopinfoid } = req.params;
    const data = await dataForShopItemPage(shopinfoid);
    return res.status(httpStatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:shopinfoid/item/:productid",
  validator.get_item,
  async (req, res, next) => {
    try {
      const { shopinfoid, productid } = req.params;
      const data = await dataForItemDescriptionPage(shopinfoid, productid);
      return res.status(httpStatusCodes.OK).json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
