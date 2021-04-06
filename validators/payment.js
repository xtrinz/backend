const { ObjectId } = require("mongodb");
const { body, oneOf } = require("express-validator");
const { validationError } = require("../error/errorhandlers");

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
const v3 = body("isRequestFromCart", "400:Bad Request").isBoolean().toBoolean();
const v4 = body("customername", "400:Please provide a valid name")
  .isLength({ min: 3, max: 25 })
  .withMessage(
    "400:Name should have atleast 3 characters and atmost 25 characters"
  )
  .isString()
  .trim()
  .escape();
const v5 = body("phonenumber", "400:Invalid Phonenumber")
  .isLength({ min: 13, max: 13 })
  .isString()
  .matches(/^\+91[0-9]{10}$/, "i")
  .trim()
  .escape();
const v6 = check("addressid", "400:Invalid Address Id")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();

const payment_add = oneOf([[v1, v2], v3]);
const place_order = [v4, v5, v6];

module.exports = {
  payment_add: [payment_add, validationError],
  place_order: [place_order, validationError],
};
