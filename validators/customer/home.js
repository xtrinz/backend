const { query, param } = require("express-validator");
const { validationError } = require("./errorhandlers");

const v1 = param("pageno", "400:Page Not Found")
  .isInt()
  .toInt()
  .trim()
  .escape();
const v2 = query(["lattitude", "longitude"], "400:Invalid Location")
  .isDecimal()
  .toFloat()
  .trim()
  .escape();

const validate_home = [v1, v2];

module.exports = {
  validate_home: [validate_home, validationError],
};
