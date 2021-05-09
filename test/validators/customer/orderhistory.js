const { param } = require("express-validator");
const { validationError } = require("./errorhandlers");

const v1 = param("purchaseId", "400:Not Found")
  .exists()
  .isMongoId()
  .customSanitizer(value => {
    return ObjectId(value);
  })
  .trim()
  .escape();

const order_status = [v1];

module.exports = {
  order_status: [order_status, validationError],
};
