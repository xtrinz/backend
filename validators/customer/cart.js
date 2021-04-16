const { ObjectId } = require("mongodb");
const { body } = require("express-validator");
const { validationError } = require("../../error/errorhandlers");

const v1 = body(["shopinfoid", "productsid"], "400:Invalid Ids")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();
const v2 = body("quantity", "400:Invalid Quantity")
  .isInt()
  .toInt()
  .trim()
  .escape();
const v3 = body("cartitemid", "400:Invalid Id")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();

const add_cart = [v1, v2];
const delete_cart = [v3];

module.exports = {
  add_cart: [add_cart, validationError],
  delete_cart: [delete_cart, validationError],
};
