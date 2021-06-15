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
    case alerts.Terminated      :

    
    break
    case alerts.Assigned        : to.push(...ctxt.Data.Agent.SockID);                                 break
    case alerts.Accepted        : to = ctxt.Data.User.SockID;                                         break
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