const { param } = require("express-validator");
const { validationError } = require("../../error/errorhandlers");
const { ObjectId } = require("mongodb");

const v1 = param("shopid", "400:Not found")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();
const v2 = param("itemid", "400:Not found")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();

const get_shop = [v1];
const get_item = [v1, v2];

module.exports = {
  get_shop: [get_shop, validationError],
  get_item: [get_item, validationError],
};
