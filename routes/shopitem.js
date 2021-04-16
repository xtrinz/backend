const express = require("express");
const {
  dataForShopItemPage,
  dataForItemDescriptionPage,
} = require("../database/shopitem");
const validator = require("../validators/shopitem");

const router = express.Router();

router.get("/:shopinfoid", validator.get_shop, async (req, res, next) => {
  try {
<<<<<<< HEAD:apiroutes/shopitemapi.js
    const { shopinfoid } = req.params;
    const data = await dataForShopItemPage(shopinfoid);
    return res.status(httpStatusCodes.OK).json(data);
=======
    const { shopid } = req.params;
    const data = await dataForShopItemPage(shopid);
    return res.status(code.OK).json(data);
>>>>>>> ebf13505400fd1710f496962b7e21c64a14e4743:routes/shopitem.js
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:shopinfoid/item/:productid",
  validator.get_item,
  async (req, res, next) => {
    try {
<<<<<<< HEAD:apiroutes/shopitemapi.js
      const { shopinfoid, productid } = req.params;
      const data = await dataForItemDescriptionPage(shopinfoid, productid);
      return res.status(httpStatusCodes.OK).json(data);
=======
      const { shopid, itemid } = req.params;
      const data = await dataForItemDescriptionPage(shopid, itemid);
      return res.status(code.OK).json(data);
>>>>>>> ebf13505400fd1710f496962b7e21c64a14e4743:routes/shopitem.js
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
