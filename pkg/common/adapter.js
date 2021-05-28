const { Err, code, status, reason } = require("./error")
    , { client }                    = require("./database")
    , { User }                      = require('../objects/user')

const Auth = async function (req, res, next)
{
  try 
  {
    const user    = new User()
    const token   = req.headers["authorization"]
    await user.Auth(token)
    req.body.User = user.Data
    next()                    // ?
  } catch (err) { next(err) }
}

const Forbidden = (req, res, next) =>
{
  try 
  {
    console.log('page-not-found')
    throw new Err(code.FORBIDDEN
                , status.Failed
                , reason.PageNotFound)
  } catch (err) { next(err) }
}

const GracefulExit = async function () 
{
  try 
  {
    console.log('graceful-exit')
    await client.close()
    process.exit(1)
  } catch (err) { console.log(err) }
}

const ErrorHandler = function(err, req, res, next) 
{
  console.error('return-err', err)
  if (err instanceof Err)
  {
    res.status(err.Code).json({
      Status  : err.Status,
      Text    : err.Reason,
      Data    : {}
    })
    return
  }
  res.status(code.INTERNAL_SERVER).json({
    Status  : status.Failed,
    Text    : reason.Unknown,
    Data    : {}
  })
}

module.exports =
{
    Auth          : Auth
  , Forbidden     : Forbidden
  , GracefulExit  : GracefulExit
  , ErrorHandler  : ErrorHandler
}