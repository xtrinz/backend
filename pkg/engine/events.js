const { states, alerts, query } = require("../common/models")
    , { User }                  = require('../objects/user')
    , { Socket }                = require('../objects/socket')
    , Emitter                   = require('events')
    , emitter                   = new Emitter()

const Connect = async function(socket_)
{
  try
  {
    const user  = new User()
    await user.Auth(String(socket_.handshake.auth.Token))

    user.Data.SockID.push(socket_.id)
    user.Data.IsLive = true    
    await user.Save()

    const socket = new Socket()
    await socket.Insert(user, socket_.id)

    console.info('client-connected',
    {
        User : user.Data
      , ID   : socket_.id
    })

  } catch(err) 
  {
    console.log('socket-auth-failed', {Error : err })
    try         { await socket_.disconnect() }
    catch(err_) { console.log('disconnection-failed', {Err: err_ }) }   
  }
}

const Disconnect = async function(socket_)
{
  try
  {
  
    const socket = new Socket()
        , sckt   = await socket.Get(socket_.id)
        , user   = new User()
    await user.Get(sckt._id, query.ByID)

    user.Data.SockID.pop(socket_.id)
    if(user.Data.SockID.length === 0)
    user.Data.IsLive = false    
    await user.Save()

    await socket.Remove(user, socket_.id)

    console.info('client-disconnected', 
    {
        SockID : socket_.id
      , User   : user.Data
    })

  }
  catch(err)
  { console.log('client-disconnection-failed', err) }

}

const Emit = async function(alert, ctxt)
{
  let to = [], data

  switch(alert)
  {

    case alerts.NewOrder:
      to   = [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID]
      data = ctxt.Abstract()
      break

    case alerts.Cancelled:
      to.push(...ctxt.Data.Shop.SockID)
      switch(ctxt.Data.State)
      {
        case states.TransitAccepted : 
        to.push(...ctxt.Data.Agent.SockID); break;
        case states.OrderAccepted   : 
        ctxt.Data.Agents.forEach((agent)=> { to.push(...agent.SockID) }); break;
      }
      data = ctxt.Abstract()
      break

    case alerts.Rejected:
      to   = ctxt.Data.User.SockID
      data = ctxt.Abstract()
      break

    case alerts.NoAgents:
      to   = ctxt.Data.User.SockID // SET ADMIN
      data = ctxt.Abstract()
      break

    case alerts.NewTransit:
      ctxt.Data.Agents.forEach((agent)=>{ to.push(...agent.SockID)})
      data =
      {
          TransitID       : ctxt.Data._id
        , JournalID       : ctxt.Data.JournalID
        , OriginName      : ctxt.Data.Store.Name
        , OriginCity      : ctxt.Data.Store.Address.City
        , OriginLocation  : [ ctxt.Data.Store.Longitude, ctxt.Data.Store.Latitude ]
        , Destination     : [ ctxt.Data.User.Longitude,  ctxt.Data.User.Latitude  ]
        , ETD             : ctxt.Data.ETD
      }
      // Calculate reach to origin and ETD to origin if needed
      break

    case alerts.Accepted:
      to   = ctxt.Data.User.SockID
      data = ctxt.Abstract()
      break

    case alerts.EnRoute:
      to   = [...ctxt.Data.Agent.SockID, ...ctxt.Data.User.SockID]
      Data = ctxt.Abstract()
      break

    case alerts.NoAgents:
        to   = ctxt.Data.User.SockID // SET ADMIN
        data = ctxt.Abstract()
        break

    case alerts.AgentReady:
      to   = [...ctxt.Data.Store.SockID, ...ctxt.Data.User.SockID]
      // As an alert for past event removal
      ctxt.Data.Agents.forEach((agent)=>
      {   if (String(agent._id) !== String(ctxt.Data.Agent._id))
          to.push(...agent.SockID)}) 
      data = ctxt.Abstract()
      break

    case alerts.EnRoute:
      to   = [...ctxt.Data.Store.SockID, ...ctxt.Data.User.SockID]
      data = ctxt.Abstract()
      break

    case alerts.Delivered:
      to   = [...ctxt.Data.Store.SockID, ...ctxt.Data.User.SockID]
      data = ctxt.Abstract()
      break      
  }

  const Ind =
  {
      To  : to
    , Msg : 
    {
        Type: alert
      , Data: data
    }
  }

  if (!Ind.To.length)
  {
      console.log('no-live-end-points-found-emission-dropped', Ind)
      return
  }
  console.log('emit-message', Ind)

  try         { await emitter.emit('SendEvent', Ind)     } 
  catch(err)  { console.log('emission-failed', err, Ind) }

}

module.exports =
{
      Emit        :   Emit
    , Channel     :   emitter
    , Connect     :   Connect
    , Disconnect  :   Disconnect
}