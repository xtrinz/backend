const { Err, Err_, code, status, reason } = require('./error')
    , { states, mode }                    = require('./models')
    , { client }                          = require('./database')
    , db                                  =
    {
        store                             : require('../config/store/archive')
      , user                              : require('../config/user/archive')
    }
    , jwt                                 = require('../infra/jwt')

let   Server, io
const SetServer = (server, io_) => { Server = server; io = io_ }

const Auth = async function (req, res, next)
{
  try 
  {
    const token   = req.headers['authorization']
        , resp    = await jwt.Verify(token)

    if(!req.body) req.body = {}

    switch(resp.Mode)
    {
      case mode.Store:

        let store = await db.store.Get(res._id, query.ByID)
        if (!store)
        {
            console.log('store-not-found', { StoreID: res._id })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }

        if (store.State !== states.Registered)
        Err_(code.UNAUTHORIZED, reason.RegIncomplete)

        req.body.Store = store
        req.body.Mode  = store.Mode

        console.log('store-authenticated', { Store: store })
      break
      default:

        let user = await db.user.Get(res._id, query.ByID)
        if (!user)
        {
            console.log('user-not-found', { UserID: res._id })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }

        if (user.State !== states.Registered)
        Err_(code.UNAUTHORIZED, reason.RegIncomplete)

        req.body.User = user
        req.body.Mode = user.Mode

        console.log('user-authenticated', { User: user })
      break
    }
 
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