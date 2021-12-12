const   Model        = require('./models')
    , { db: _db }    = require('./database')
    , db             = require('../config/exports')[Model.segment.db]
    , jwt            = require('../infra/jwt')
    , rbac           = require('../system/rbac')
    , input          = require('./input')
    , Log            = require('./log')

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

    if(!mode_[Model.mode.Enabled]) 
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
      case Model.mode.Store:

        let store = await db.store.Get(resp._id, Model.query.ByID)
        if (!store)
        {
            Log('store-not-found', { StoreID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(store.State))
        {
          Log('state-mismatch-for-store-auth', { Store: store, ModeState : mode_.State })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Store    = store
        req.query.StoreID = store._id        
        req.body.Mode     = resp.Mode

        Log('store-authenticated', { Store: store })
      break
      case Model.mode.Agent:

        let agent = await db.agent.Get(resp._id, Model.query.ByID)
        if (!agent)
        {
            Log('agent-not-found', { AgentID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(agent.State))
        {
          Log('state-mismatch-for-agent-auth', { Agent: agent })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Agent = agent
        req.body.Mode  = agent.Mode

        Log('agent-authenticated', { Agent: agent })    
        break

      case Model.mode.Admin:

        let admin = await db.admin.Get(resp._id, Model.query.ByID)
        if (!admin)
        {
            Log('agent-not-found', { AdminID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(admin.State))
        {
          Log('state-mismatch-for-admin-auth', { Admin: admin })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Admin = admin
        req.body.Mode  = Model.mode.Admin

        Log('admin-authenticated', { Admin: admin })    
        break        

      case Model.mode.User:

        let user = await db.user.Get(resp._id, Model.query.ByID)
        if (!user)
        {
            Log('user-not-found', { UserID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(user.State))
        {
          Log('state-mismatch-for-user-auth', { User: user })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
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
      Model.Err_(Model.code.UNAUTHORIZED, Model.reason.PermissionDenied)    
    }
  } catch (err) { next(err) }
}

const Forbidden = (req, res, next) =>
{
  try 
  {
    Log('page-not-found')
    Model.Err_(Model.code.FORBIDDEN, Model.reason.PageNotFound)
  } catch (err) { next(err) }
}

const GracefulExit = async function () 
{
  try 
  {
    Log('graceful-exit')
    await new Promise((res, rej)=>
    {
      io.close((err)=>
      {
        if(!err) { res(1); Log('socket-stopped') }
        else     { Log('socket-abruptly-terminated'); rej(1) }
      })
    })

    await new Promise((res, rej)=>
    {
      _db().client.close((err)=>
      {
        if(!err) { res(1); Log('db-connection-closed') } 
        else     { Log('db-abruptly-disconnected'); rej(1) }
      })
    })

    await new Promise((res, rej)=>
    {
      Server.close((err)=>
      {
        if(!err) { res(1); Log('server-stopped') }
        else     { Log('server-abruptly-terminated'); rej(1) }
      })
    })

    process.exit(1)
  } catch (err) 
  {
    Log(err)
    process.exit(1) 
  }
}

const ErrorHandler = function(err, req, res, next) 
{
  Log('return-err', err)
  if (err instanceof Model.Err)
  {
    res.status(err.Code).json({
      Status  : err.Status,
      Text    : err.Reason,
      Data    : {}
    })
    return
  }
  res.status(Model.code.INTERNAL_SERVER).json({
    Status  : Model.status.Failed,
    Text    : Model.reason.Unknown,
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