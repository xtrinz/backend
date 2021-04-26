const { code } = require("../../common/error");
const BaseError = require("../errorclass/baserror");

class Api400Error extends BaseError {
  constructor(
    name = "Bad Request",
    description = "Bad Request",
    statusCode = code.BAD_REQUEST,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api401Error extends BaseError {
  constructor(
    name = "Unauthorized",
    description = "Unauthorized",
    statusCode = code.UNAUTHORIZED,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api403Error extends BaseError {
  constructor(
    name = "Forbidden",
    description = "Forbidden",
    statusCode = code.FORBIDDEN,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api404Error extends BaseError {
  constructor(
    name = "Not found",
    description = "Not found",
    statusCode = code.NOT_FOUND,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api409Error extends BaseError {
  constructor(
    name = "Conflict",
    description = "Conflict",
    statusCode = code.CONFLICT,
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class Api500Error extends BaseError {
  constructor(
    name = "Internal Server Error",
    description = "Internal Server Error",
    statusCode = code.INTERNAL_SERVER,
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
