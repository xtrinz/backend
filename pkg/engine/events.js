const { states, alerts } = require('../system/models')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Emit = async function(alert, ctxt)
{
  let to = []
  switch(alert)
  {
    case alerts.NewOrder        : to = [...ctxt.User.SockID, ...ctxt.Store.SockID];         break
    case alerts.Cancelled       : to.push(...ctxt.Store.SockID)
                                  switch(ctxt.State)
                                  {
                                      case states.TransitAccepted : 
                                          to.push(...ctxt.Agent.SockID);                         break
                                      case states.OrderAccepted   : 
                                          ctxt.Agents.forEach((agent)=> {
                                            to.push(...agent.SockID) });                              break
                                  };                                                                  break
    case alerts.Rejected        : to.push(...ctxt.User.SockID)                               
                                  switch(ctxt.State)
                                  {
                                      case states.TransitAccepted : 
                                          to.push(...ctxt.Agent.SockID);                         break
                                      case states.OrderAccepted   : 
                                          ctxt.Agents.forEach((agent)=> { 
                                          to.push(...agent.SockID) });                                break
                                  };                                                                  break
    case alerts.NoAgents        : ctxt.Admins.forEach((admin)=> { to.push(...admin.SockID) });   break
    case alerts.Locked          :
                                  ctxt.Admins.forEach((admin) =>
                                  { 
                                      if (String(admin._id) !== String(ctxt.Admin._id)) 
                                      to.push(...admin.SockID)
                                  });                                                                 break
    case alerts.Terminated      : to.push(...ctxt.User.SockID);
                                  to.push(...ctxt.Store.SockID); to.push(...ctxt.Agent.SockID)
                                  ctxt.Agents.forEach((agent)=> { to.push(...agent.SockID) });   break // If any
    case alerts.Assigned        : to.push(...ctxt.Agent.SockID);                                 break
    case alerts.Accepted        : to = [...ctxt.User.SockID, ...ctxt.Store.SockID];         break
    case alerts.Processed       : to = [...ctxt.User.SockID, ...ctxt.Agent.SockID];         break
    case alerts.NewTransit      : ctxt.Agents.forEach((agent)=>{ to.push(...agent.SockID)});     break
    case alerts.EnRoute         : to = [...ctxt.Agent.SockID, ...ctxt.User.SockID];         break
    case alerts.AgentReady      : to = [...ctxt.Store.SockID, ...ctxt.User.SockID]
                                      ctxt.Agents.forEach((agent)=>
                                  { if (String(agent._id) !== String(ctxt.Agent._id)) to.push(...agent.SockID)}); break
    case alerts.Delivered       : to = [...ctxt.Store.SockID, ...ctxt.User.SockID];         break      
  }

  const Ind =
  {
      To  : to
    , Msg : 
    {
        Type: alert
      , Data: { TransitID : ctxt._id }
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
    , SetChannel  :   SetChannel
}