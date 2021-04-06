const { query } = require("express-validator");
const { validationError } = require("../error/errorhandlers");

const v1 = query("searchresult", "400:Not found").isString().trim().escape();

const search_res = [v1];

module.exports = {
  search_res: [search_res, validationError],
};
