require("dotenv").config()
const { Err, code, status, reason } = require("./error")

const Auth = async function (req, res, next)
{
  try 
  {
    const user    = new User()
    const token   = req.headers["Authorization"]
    await user.Auth(token)
    req.body.User = user
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

const GracefulExit = async function () {
  try {
    await client.close()
  } catch (error) {
    console.log(error)
  }
}

module.exports =
{
    Auth      : Auth
  , Forbidden : Forbidden
}