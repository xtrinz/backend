const { Err, Err_, code, status
    , reason , mode, query }              = require('./models')
    , { client }                          = require('./database')
    , db                                  =
    {
        store                             : require('../config/store/archive')
      , user                              : require('../config/user/archive')
      , agent                             : require('../config/agent/archive')
      , admin                             : require('../config/admin/archive')            
    }
    , jwt                                 = require('../infra/jwt')
    , rbac                                = require('../system/rbac')
    , input                               = require('./input')
    , Log                                 = require('./log')

let   Server, io
const SetServer = (server, io_) => { Server = server; io = io_ }

const SecInput = async function(req, res, next)
{
  try 
  {
    let path = req.url
    const objs = path.path()
        , inst = new input.Controller()

    await inst.IsHonest(req, objs[0], objs[1], req.method)

    next()
  } catch (err) { next(err) }
}

const Authnz = async function (req, res, next)
{
  try 
  {    

    let path = req.url
    const objs      = path.path()
        , acc_ctrlr = new rbac.Controller()
        , task_     = (req.body && req.body.Task)? req.body.Task: 'None'
        , mode_     = acc_ctrlr.HasAccess(objs[0], objs[1], req.method, task_)

    if(!mode_[mode.Enabled]) 
    {
      next()
      return
    }

    const token   = req.headers['authorization']
        , resp    = await jwt.Verify(token)

    if(!req.body) req.body   = {}
    if(!req.query) req.query = {}

    switch(resp.Mode)
    {
      case mode.Store:

        let store = await db.store.Get(resp._id, query.ByID)
        if (!store)
        {
            Log('store-not-found', { StoreID: resp._id })
            Err_(code.UNAUTHORIZED, reason.InvalidToken)
        }

        if (!mode_.State.includes(store.State))
        {
          Log('state-mismatch-for-store-auth', { Store: store, ModeState : mode_.State })
          Err_(code.UNAUTHORIZED, reason.RegIncomplete)
        }

        req.body.Store    = store
        req.query.StoreID = store._id        
        req.body.Mode     = resp.Mode

        Log('store-authenticated', { Store: store })
      break
      case mode.Agent:

        let agent = await db.agent.Get(resp._id, query.ByID)
        if (!agent)
        {
            Log('agent-not-found', { AgentID: resp._id })
            Err_(code.UNAUTHORIZED, reason.InvalidToken)
        }

        if (!mode_.State.includes(agent.State))
        {
          Log('state-mismatch-for-agent-auth', { Agent: agent })
          Err_(code.UNAUTHORIZED, reason.RegIncomplete)
        }

        req.body.Agent = agent
        req.body.Mode  = agent.Mode

        Log('agent-authenticated', { Agent: agent })    
        break

      case mode.Admin:

        let admin = await db.admin.Get(resp._id, query.ByID)
        if (!admin)
        {
            Log('agent-not-found', { AdminID: resp._id })
            Err_(code.UNAUTHORIZED, reason.InvalidToken)
        }

        if (!mode_.State.includes(admin.State))
        {
          Log('state-mismatch-for-admin-auth', { Admin: admin })
          Err_(code.UNAUTHORIZED, reason.RegIncomplete)
        }

        req.body.Admin = admin
        req.body.Mode  = mode.Admin

        Log('admin-authenticated', { Admin: admin })    
        break        

      case mode.User:

        let user = await db.user.Get(resp._id, query.ByID)
        if (!user)
        {
            Log('user-not-found', { UserID: resp._id })
            Err_(code.UNAUTHORIZED, reason.InvalidToken)
        }

        if (!mode_.State.includes(user.State))
        {
          Log('state-mismatch-for-user-auth', { User: user })
          Err_(code.UNAUTHORIZED, reason.RegIncomplete)
        }

        req.body.User = user
        req.body.Mode = user.Mode

        Log('user-authenticated', { User: user })  
        break
    }
 
    if(req.body.Mode && mode_[req.body.Mode])  
      next()
    else
    {
      Log('operation-not-permited', 
      {   Body         : req.body
        , Query        : req.body
        , AllowedModes : mode_ })                     
      Err_(code.UNAUTHORIZED, reason.PermissionDenied)    
    }
  } catch (err) { next(err) }
}

const Forbidden = (req, res, next) =>
{
  try 
  {
    Log('page-not-found')
    Err_(code.FORBIDDEN, reason.PageNotFound)
  } catch (err) { next(err) }
}

const GracefulExit = async function () 
{
  try 
  {
    Log('graceful-exit')
    await new Promise((res)=>
    {
      io.close((err)=>
      {
        if(!err) { res(1); Log('socket-stopped') }
        else Log('socket-abruptly-terminated')
      })
    })

    await new Promise((res)=>
    {
      client.close((err)=>
      {
        if(!err) { res(1); Log('db-connection-closed') } 
        else Log('db-abruptly-disconnected')
      })
    })

    await new Promise((res)=>
    {
      Server.close((err)=>
      {
        if(!err) { res(1); Log('server-stopped') }
        else Log('server-abruptly-terminated')
      })
    })

    process.exit(1)
  } catch (err) { Log(err) }
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
    Authnz        : Authnz
  , SecInput      : SecInput
  , SetServer     : SetServer
  , Forbidden     : Forbidden
  , GracefulExit  : GracefulExit
  , ErrorHandler  : ErrorHandler
}