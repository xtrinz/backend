const Emitter = require('events')
const emitter = new Emitter

/*
    1. Authenticate user
    2. Create sock_id-vs-user lookup
    3. Push sock_id to user record
    4. Push sock_id to transaction record if any
*/
const Connect = function(socket)
{
    console.info('client-connected', socket.id, socket.handshake.auth)
    /*
        sock_id
        auth.user_id
        auth.token
    */
}

/*
    1. Pull sock_id from transit record if any
    2. Pull sock_id from user record
    3. Delete sock_id-vs-user lookup
*/
const Disconnect = function(socket)
{
    console.info(`client-disconnected ${socket}`)
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
        , OriginCity      : ctxt.Data.Store.City
        , OriginLocation  : ctxt.Data.Store.Location
        , Destination     : ctxt.Data.User.Location
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

  }

  const Ind =
  {
      To  : to
    , Msg : 
    {
        Type: alert
      , Data: Data
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