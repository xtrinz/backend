const { states, alerts } = require('../system/models')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Emit = async function(alert, ctxt)
{
  let to = []
  switch(alert)
  {
    case alerts.NewOrder        : to = [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID];         break
    case alerts.Cancelled       : to.push(...ctxt.Data.Store.SockID)
                                  switch(ctxt.Data.State)
                                  {
                                      case states.TransitAccepted : 
                                          to.push(...ctxt.Data.Agent.SockID);                         break
                                      case states.OrderAccepted   : 
                                          ctxt.Data.Agents.forEach((agent)=> {
                                            to.push(...agent.SockID) });                              break
                                  };                                                                  break
    case alerts.Rejected        : to.push(...ctxt.Data.User.SockID)                               
                                  switch(ctxt.Data.State)
                                  {
                                      case states.TransitAccepted : 
                                          to.push(...ctxt.Data.Agent.SockID);                         break
                                      case states.OrderAccepted   : 
                                          ctxt.Data.Agents.forEach((agent)=> { 
                                          to.push(...agent.SockID) });                                break
                                  };                                                                  break
    case alerts.NoAgents        : ctxt.Data.Admins.forEach((admin)=> { to.push(...admin.SockID) });   break
    case alerts.Locked          :
                                  ctxt.Data.Admins.forEach((admin) =>
                                  { 
                                      if (String(admin._id) !== String(ctxt.Data.Admin._id)) 
                                      to.push(...admin.SockID)
                                  });                                                                 break
    case alerts.Terminated      : to.push(...ctxt.Data.User.SockID);
                                  to.push(...ctxt.Data.Store.SockID); to.push(...ctxt.Data.Agent.SockID)
                                  ctxt.Data.Agents.forEach((agent)=> { to.push(...agent.SockID) });   break // If any
    case alerts.Assigned        : to.push(...ctxt.Data.Agent.SockID);                                 break
    case alerts.Accepted        : to = [...ctxt.Data.User.SockID, ...ctxt.Data.Store.SockID];         break
    case alerts.Processed       : to = [...ctxt.Data.User.SockID, ...ctxt.Data.Agent.SockID];         break
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
    , SetChannel  :   SetChannel
}