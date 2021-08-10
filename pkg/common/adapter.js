const { Err, Err_, code, status, reason } = require('./error')
    , { states }                          = require('./models')
    , { client }                          = require('./database')
    , { User }                            = require('../config/user/driver')

let   Server, io
const SetServer = (server, io_) => { Server = server; io = io_ }

const Auth = async function (req, res, next)
{
  try 
  {
    const user    = new User()
    const token   = req.headers['authorization']
    await user.Auth(token)

    if (user.Data.State !== states.Registered)
    Err_(code.UNAUTHORIZED, reason.RegIncomplete)

    if(!req.body) req.body = {}
    req.body.User = user.Data
    next()
  } catch (err) { next(err) }
}

const Forbidden = (req, res, next) =>
{
  try 
  {
    console.log('page-not-found')
    Err_(code.FORBIDDEN, reason.PageNotFound)
  } catch (err) { next(err) }
}

const GracefulExit = async function () 
{
  try 
  {
    console.log('graceful-exit')
    await new Promise((res)=>
    {
      io.close((err)=>
      {
        if(!err) { res(1); console.log('socket-stopped') }
        else console.log('socket-abruptly-terminated')
      })
    })

    await new Promise((res)=>
    {
      client.close((err)=>
      {
        if(!err) { res(1); console.log('db-connection-closed') } 
        else console.log('db-abruptly-disconnected')
      })
    })

    await new Promise((res)=>
    {
      Server.close((err)=>
      {
        if(!err) { res(1); console.log('server-stopped') }
        else console.log('server-abruptly-terminated')
      })
    })

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
  , SetServer     : SetServer
  , Forbidden     : Forbidden
  , GracefulExit  : GracefulExit
  , ErrorHandler  : ErrorHandler
}