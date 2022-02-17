const   Model     = require('./models')
    , { db: _db, Connect } = require('./database')
    , db          = require('../pipe/exports')[Model.segment.db]
    , jwt         = require('../infra/jwt')
    , rbac        = require('../sys/rbac')
    , input       = require('./input')
    , Log         = require('./log')
    , ledger      = require( '../pipe/fin/ledger/driver')

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
      case Model.mode.Seller:

        let seller = await db.seller.Get(resp._id, Model.query.ByID)
        if (!seller)
        {
            Log('seller-not-found', { SellerID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(seller.State))
        {
          Log('state-mismatch-for-seller-auth', { Seller: seller, ModeState : mode_.State })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Seller    = seller
        req.query.SellerID = seller._id        
        req.body.Mode     = resp.Mode

        Log('seller-authenticated', { Seller: seller })
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

      case Model.mode.Arbiter:

        let arbiter = await db.arbiter.Get(resp._id, Model.query.ByID)
        if (!arbiter)
        {
            Log('agent-not-found', { ArbiterID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(arbiter.State))
        {
          Log('state-mismatch-for-arbiter-auth', { Arbiter: arbiter })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Arbiter = arbiter
        req.body.Mode  = Model.mode.Arbiter

        Log('arbiter-authenticated', { Arbiter: arbiter })    
        break        

      case Model.mode.Client:

        let client = await db.client.Get(resp._id, Model.query.ByID)
        if (!client)
        {
            Log('client-not-found', { ClientID: resp._id })
            Model.Err_(Model.code.UNAUTHORIZED, Model.reason.InvalidToken)
        }

        if (!mode_.State.includes(client.State))
        {
          Log('state-mismatch-for-client-auth', { Client: client })
          Model.Err_(Model.code.UNAUTHORIZED, Model.reason.RegIncomplete)
        }

        req.body.Client = client
        req.body.Mode = client.Mode

        Log('client-authenticated', { Client: client })  
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

const BringUp = async function () 
{
  try 
  {    
    await Connect()     
    await ledger.System()

  } catch (err) 
  {
    Log(err)
    process.exit(1) 
  }
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
    Authnz       , SecInput
  , SetServer    , Forbidden
  , GracefulExit , ErrorHandler
  , BringUp
}