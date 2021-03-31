const httpStatusCodes = require("../httpstatuscode");
const BaseError = require("../errorclass/baserror");

class Api400Error extends BaseError {
  constructor(
    name = "Bad Request",
    description = "Bad Request",
    statusCode = httpStatusCodes.BAD_REQUEST,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api401Error extends BaseError {
  constructor(
    name = "Unauthorized",
    description = "Unauthorized",
    statusCode = httpStatusCodes.UNAUTHORIZED,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api403Error extends BaseError {
  constructor(
    name = "Forbidden",
    description = "Forbidden",
    statusCode = httpStatusCodes.FORBIDDEN,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api404Error extends BaseError {
  constructor(
    name = "Not found",
    description = "Not found",
    statusCode = httpStatusCodes.NOT_FOUND,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api409Error extends BaseError {
  constructor(
    name = "Conflict",
    description = "Conflict",
    statusCode = httpStatusCodes.CONFLICT,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api500Error extends BaseError {
  constructor(
    name = "Internal Server Error",
    description = "Internal Server Error",
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = {
  Api400Error,
  Api401Error,
  Api403Error,
  Api404Error,
  Api409Error,
  Api500Error,
};
