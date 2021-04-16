const { check, body } = require("express-validator");
const { ObjectId } = require("mongodb");
const { validationError } = require("../../error/errorhandlers");

const v1 = check("addressid", "400:Invalid Address Id")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();
const v2 = body("isfavourite", "400:Bad Request").isBoolean().toBoolean();

const addr_with_id = [v1];
const addr_fav = [v1, v2];

module.exports = {
  addr_with_id: [addr_with_id, validationError],
  addr_fav: [addr_fav, validationError],
};
