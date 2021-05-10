const { client } = require("../../../objects/connect")
const { code } = require("../../../common/error")
const { validationResult } = require("express-validator");

class BaseError extends Error {
  constructor(name, statusCode, isOperational, description) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

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

const GracefulExit = async function () 
{
  try 
  {
    console.log('graceful-exit')
    await client.close()
  } catch (err) { console.log(err) }
}


function returnError(err, req, res, next) {
  console.error(err);
  res
    .status(err.statusCode || code.INTERNAL_SERVER)
    .send(err.message);
}

function validationError(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped());
      const object = errors.mapped();
      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          const element = object[key];
          console.log(element.nestedErrors);
          let message;
          if (element.nestedErrors) {
            message = element.nestedErrors[0].msg;
          } else {
            message = element.msg;
          }
          const statusCode = String(message).slice(0, 3);
          const errMessage = String(message).slice(4);
          if (statusCode == "400") {
            throw new Api400Error("Bad Request", errMessage);
          } else if (statusCode == "401") {
            throw new Api401Error("Unauthorized", errMessage);
          } else if (statusCode == "409") {
            throw new Api409Error("Conflict", errMessage);
          }
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  returnError,
  validationError,
};
