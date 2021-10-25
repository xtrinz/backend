const { states, alerts, 
      query, mode, limits,
      resource: rsrc, verb, method,      
      Err_, code, reason } = require('../system/models')
    , { Socket }           = require('../config/socket/driver')
    , db                   =
    {
        user               : require('../config/user/archive')
      , agent              : require('../config/agent/archive')
      , store              : require('../config/store/archive')        
      , socket             : require('../config/socket/archive')
    }
    , jwt                  = require('../infra/jwt')
    , input                = require('../system/input')

let Channel 

const SetChannel = (io_) => { Channel = io_ }

const Connect = async function(socket_)
{
  try
  {
    const inst = new input.Controller()
    await inst.IsHonest(socket_, rsrc.socket, verb.connect, method.void)

    const token   = String(socket_.handshake.auth.Token)
        , resp    = await jwt.Verify(token)

    let data, sock_id
    switch(resp.Mode)
    {
      case mode.Store:

        data = await db.store.Get(resp._id, query.ByID)
        if (!data)
        {
            console.log('store-not-found', { StoreID: resp._id })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }
        data.SockID.push(socket_.id)
        
        if(data.SockID.length > limits.SocketCount)
          sock_id = data.SockID[0]

        data.IsLive = true    
        await db.store.Save(data)
        break

      case mode.Agent:  
          data = await db.agent.Get(resp._id, query.ByID)
          if (!data)
          {
              console.log('agent-not-found', { AgentID: resp._id })
              Err_(code.BAD_REQUEST, reason.InvalidToken)
          }
          data.SockID.push(socket_.id)
  
          if(data.SockID.length > limits.SocketCount)
            sock_id = data.SockID[0]
  
          data.IsLive = true    
          await db.agent.Save(data)
          break

      case mode.User:
      case mode.Admin:

        data = await db.user.Get(resp._id, query.ByID)
        if (!data)
        {
            console.log('user-not-found', { UserID: resp._id })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }
        data.SockID.push(socket_.id)

        if(data.SockID.length > limits.SocketCount)
          sock_id = data.SockID[0]

        data.IsLive = true    
        await db.user.Save(data)
        break
      default:
        console.log('connection-failed-invalid-mode', { Token : resp })
        Err_(code.BAD_REQUEST, reason.InvalidToken)        
        break
    }
    const socket = new Socket()
    await socket.Insert(data, resp.Mode, socket_.id)
    
    if(data.SockID.length > limits.SocketCount)
    {
      const socket_a  = await Channel.sockets.sockets.get(sock_id)
      await Disconnect(socket_a)
      socket_a.disconnect()
    }

    console.info('client-connected', { Client : data, SockID : socket_.id })

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
    
    const inst = new input.Controller()
    await inst.IsHonest(socket_, rsrc.socket, verb.disconnect, method.void)

    const sckt   = await db.socket.Get(socket_.id)
    let data, index
    switch(sckt.Mode)
    {
      case mode.Store:

        data = await db.store.Get(sckt.Entity, query.ByID)
        if (!data)
        {
            console.log('store-not-found', { StoreID: sckt.Entity })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }
        index = await data.SockID.indexOf(String(socket_.id))
        if (index > -1) { data.SockID.splice(index, 1) }

        if(data.SockID.length === 0)
          data.IsLive = false    
  
        await db.store.Save(data)
        break

      case mode.Agent:
  
          data = await db.agent.Get(sckt.Entity, query.ByID)
          if (!data)
          {
              console.log('agent-not-found', { AgentID: sckt.Entity })
              Err_(code.BAD_REQUEST, reason.InvalidToken)
          }
          index = await data.SockID.indexOf(String(socket_.id))
          if (index > -1) { data.SockID.splice(index, 1) }

          if(data.SockID.length === 0)
            data.IsLive = false    
    
          await db.agent.Save(data)
          break

      case mode.User:
      case mode.Admin:

        data = await db.user.Get(sckt.Entity, query.ByID)
        if (!data)
        {
            console.log('user-not-found', { UserID: sckt.Entity })
            Err_(code.BAD_REQUEST, reason.InvalidToken)
        }
        index = await data.SockID.indexOf(String(socket_.id))
        if (index > -1) { data.SockID.splice(index, 1) }

        if(data.SockID.length === 0)
          data.IsLive = false    
 
        await db.user.Save(data)
        break
      default:
        console.log('disconnection-failed-invalid-mode', { Data : sckt })
        Err_(code.BAD_REQUEST, reason.InvalidToken)        
        break        
    }

    const socket = new Socket()
    await socket.Remove(data, sckt.Mode, socket_.id)

    console.info('client-disconnected', { Client : data, SockID : socket_.id })
  }
  catch(err)
  { console.log('client-disconnection-failed', {Err : err }) }

}

const Emit = async function(alert, ctxt)
{
  let to = []
  switch(alert)
  {
    case alerts.NewOrder        : to = [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID];         break
    case alerts.Cancelled       : to.push(...ctxt.Data.Store.SockID)
    switch(ctxt.Data.State)
    {
    case states.TransitAccepted : to.push(...ctxt.Data.Agent.SockID);                                 break
    case states.OrderAccepted   : ctxt.Data.Agents.forEach((agent)=> { to.push(...agent.SockID) });   break
    };                                                                                                break
    case alerts.Rejected        : to.push(...ctxt.Data.User.SockID)                               
    switch(ctxt.Data.State)
    {
    case states.TransitAccepted : to.push(...ctxt.Data.Agent.SockID);                                 break
    case states.OrderAccepted   : ctxt.Data.Agents.forEach((agent)=> { to.push(...agent.SockID) });   break
    };                                                                                                break
    case alerts.NoAgents        : ctxt.Data.Admins.forEach((admin)=> { to.push(...admin.SockID) });   break
    case alerts.Locked          :
        ctxt.Data.Admins.forEach((admin) =>
        { if (String(admin._id) !== String(ctxt.Data.Admin._id)) to.push(...admin.SockID)});          break
    case alerts.Terminated      : to.push(...ctxt.Data.User.SockID);
                                  to.push(...ctxt.Data.Store.SockID); to.push(...ctxt.Data.Agent.SockID)
                                  ctxt.Data.Agents.forEach((agent)=> { to.push(...agent.SockID) });   break // If any
    case alerts.Assigned        : to.push(...ctxt.Data.Agent.SockID);                                 break
    case alerts.Accepted        : to = [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID];         break
    case alerts.NewTransit      : ctxt.Data.Agents.forEach((agent)=>{ to.push(...agent.SockID)});     break
    case alerts.EnRoute         : to = [...ctxt.Data.Agent.SockID, ...ctxt.Data.User.SockID];         break
    case alerts.AgentReady      : to = [...ctxt.Data.Store.SockID, ...ctxt.Data.User.SockID]
                    ctxt.Data.Agents.forEach((agent)=>
                 { if (String(agent._id) !== String(ctxt.Data.Agent._id)) to.push(...agent.SockID)}); break
    case alerts.Delivered       : to = [...ctxt.Data.Store.SockID, ...ctxt.Data.User.SockID];         break      
  }

  const Ind =
  {
      To  : to
    , Msg : 
    {
        Type: alert
      , Data: { TransitID : ctxt.Data._id }
    }
  }

  if (!Ind.To.length)
  {
      console.log('no-live-end-points-emission-dropped', Ind)
      return
  }
  console.log('emit-message', Ind)

  try         { await Channel.to(Ind.To).emit('Event', Ind.Msg) } 
  catch(err)  { console.log('emission-failed', err, Ind)        }

}

module.exports =
{
      Emit        :   Emit
    , Connect     :   Connect
    , Disconnect  :   Disconnect
    , SetChannel  :   SetChannel
}