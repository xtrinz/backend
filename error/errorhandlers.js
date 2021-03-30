const { gracefulShutdown } = require("../functions");
const BaseError = require("./errorclass/baserror");
const httpStatusCodes = require("./httpstatuscode");

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

module.exports = {
  logError,
  logErrorMiddleware,
  returnError,
  isOperationalError,
  handleUnCaughtException,
  handlePromiseRejection,
};
