const Model  = require('../../system/models')
    , socket = require('../socket/driver')
    , db     = require('../exports')[Model.segment.db]
    , jwt    = require('../../infra/jwt')
    , input  = require('../../system/input')
    , Log    = require('../../system/log')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Connect = async function(socket_)
{
  try
  {
    const inst = new input.Controller()
    await inst.IsHonest(socket_, Model.resource.socket, Model.verb.connect, Model.method.void)

    const token   = String(socket_.handshake.auth.Token)
        , resp    = await jwt.Verify(token)

    let data, sock_id
    switch(resp.Mode)
    {
      case Model.mode.Store:

        data = await db.store.Get(resp._id, Model.query.ByID)
        if (!data)
        {
            Log('store-not-found', { StoreID: resp._id })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
        }
        data.SockID.push(socket_.id)
        
        if(data.SockID.length > Model.limits.SocketCount)
          sock_id = data.SockID[0]

        data.IsLive = true    
        await db.store.Save(data)
        break

      case Model.mode.Agent:  
          data = await db.agent.Get(resp._id, Model.query.ByID)
          if (!data)
          {
              Log('agent-not-found', { AgentID: resp._id })
              Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
          }
          data.SockID.push(socket_.id)
  
          if(data.SockID.length > Model.limits.SocketCount)
            sock_id = data.SockID[0]
  
          data.IsLive = true    
          await db.agent.Save(data)
          break

      case Model.mode.Admin:  
          data = await db.admin.Get(resp._id, Model.query.ByID)
          if (!data)
          {
              Log('admin-not-found', { AdminID: resp._id })
              Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
          }
          data.SockID.push(socket_.id)
  
          if(data.SockID.length > Model.limits.SocketCount)
            sock_id = data.SockID[0]
  
          data.IsLive = true    
          await db.admin.Save(data)
          break

      case Model.mode.User:

        data = await db.user.Get(resp._id, Model.query.ByID)
        if (!data)
        {
            Log('user-not-found', { UserID: resp._id })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
        }
        data.SockID.push(socket_.id)

        if(data.SockID.length > Model.limits.SocketCount)
          sock_id = data.SockID[0]

        data.IsLive = true    
        await db.user.Save(data)
        break
      default:
        Log('connection-failed-invalid-mode', { Token : resp })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)        
        break
    }
    await socket.Insert(data, resp.Mode, socket_.id)
    
    if(data.SockID.length > Model.limits.SocketCount)
    {
      const socket_a  = await Channel.sockets.sockets.get(sock_id)
      await Disconnect(socket_a)
      socket_a.disconnect()
    }

    console.info('client-connected', { Client : data, SockID : socket_.id })

  } catch(err) 
  {
    Log('socket-auth-failed', {Error : err })
    try         { await socket_.disconnect() }
    catch(err_) { Log('disconnection-failed', {Err: err_ }) }   
  }
}

const Disconnect = async function(socket_)
{
  try
  {
    
    const inst = new input.Controller()
    await inst.IsHonest(socket_, Model.resource.socket, Model.verb.disconnect, Model.method.void)

    const sckt   = await db.socket.Get(socket_.id)
    let data, index
    switch(sckt.Mode)
    {
      case Model.mode.Store:

        data = await db.store.Get(sckt.Entity, Model.query.ByID)
        if (!data)
        {
            Log('store-not-found', { StoreID: sckt.Entity })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
        }
        index = await data.SockID.indexOf(String(socket_.id))
        if (index > -1) { data.SockID.splice(index, 1) }

        if(data.SockID.length === 0)
          data.IsLive = false    
  
        await db.store.Save(data)
        break

      case Model.mode.Agent:
  
          data = await db.agent.Get(sckt.Entity, Model.query.ByID)
          if (!data)
          {
              Log('agent-not-found', { AgentID: sckt.Entity })
              Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
          }
          index = await data.SockID.indexOf(String(socket_.id))
          if (index > -1) { data.SockID.splice(index, 1) }

          if(data.SockID.length === 0)
            data.IsLive = false    
    
          await db.agent.Save(data)
          break

      case Model.mode.Admin:

        data = await db.admin.Get(sckt.Entity, Model.query.ByID)
        if (!data)
        {
            Log('admin-not-found', { AdminID: sckt.Entity })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
        }
        index = await data.SockID.indexOf(String(socket_.id))
        if (index > -1) { data.SockID.splice(index, 1) }

        if(data.SockID.length === 0)
          data.IsLive = false    
  
        await db.admin.Save(data)
        break

      case Model.mode.User:

        data = await db.user.Get(sckt.Entity, Model.query.ByID)
        if (!data)
        {
            Log('user-not-found', { UserID: sckt.Entity })
            Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
        }
        index = await data.SockID.indexOf(String(socket_.id))
        if (index > -1) { data.SockID.splice(index, 1) }

        if(data.SockID.length === 0)
          data.IsLive = false    
 
        await db.user.Save(data)
        break
      default:
        Log('disconnection-failed-invalid-mode', { Data : sckt })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)        
        break        
    }

    await socket.Remove(data, sckt.Mode, socket_.id)

    console.info('client-disconnected', { Client : data, SockID : socket_.id })
  }
  catch(err)
  { Log('client-disconnection-failed', {Err : err }) }

}

module.exports =
{
      Connect     :   Connect
    , Disconnect  :   Disconnect
    , SetChannel  :   SetChannel
}