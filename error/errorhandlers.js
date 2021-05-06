const { client } = require("../database/connect")
const BaseError = require("./errorclass/baserror");
const { code } = require("../common/error")
const { validationResult } = require("express-validator");
const {
  Api400Error,
  Api409Error,
  Api401Error,
} = require("./errorclass/errorclass");


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

async function handleUnCaughtException(error) {
  console.error(error);
  let isOpErr = false
  if (error instanceof BaseError) {
    isOpErr = error.isOperational
  }
  if (!isOpErr) {
    process.exit(1); // Todo : we need pm2 to restart automatically in production environment
  } else {
    await GracefulExit();
  }
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
  handleUnCaughtException,
  validationError,
};
