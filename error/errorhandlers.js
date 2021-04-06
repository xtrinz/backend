const { gracefulShutdown } = require("../functions");
const BaseError = require("./errorclass/baserror");
const httpStatusCodes = require("./httpstatuscode");
const { validationResult } = require("express-validator");
const {
  Api400Error,
  Api409Error,
  Api401Error,
} = require("./errorclass/errorclass");

function logError(err) {
  console.error(err);
}

function logErrorMiddleware(err, req, res, next) {
  logError(err);
  next(err);
}

function returnError(err, req, res, next) {
  res
    .status(err.statusCode || httpStatusCodes.INTERNAL_SERVER)
    .send(err.message);
}

function isOperationalError(error) {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}

async function handleUnCaughtException(error) {
  logError(error);
  if (!isOperationalError(error)) {
    process.exit(1); // Todo : we need pm2 to restart automatically in production environment
  } else {
    await gracefulShutdown();
  }
}

function handlePromiseRejection(error) {
  logError(error);
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
  logError,
  logErrorMiddleware,
  returnError,
  isOperationalError,
  handleUnCaughtException,
  handlePromiseRejection,
  validationError,
};
