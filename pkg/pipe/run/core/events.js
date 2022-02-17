const { alerts, mode } = require('../../../sys/models')
    , Log        = require('../../../sys/log')
    , cache      = require('../../../infra/cache')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Emit = async function(alert, ctxt)
{
  try         
  { 

    let client = [], seller = [], agent = [], arbiter = []
    client = cache.GetByRoleID(ctxt.Client.ID, mode.Client)
    seller = cache.GetByRoleID(ctxt.Seller.ID, mode.Seller)
    if(ctxt.Agent   && ctxt.Agent.ID)   agent   = cache.GetByRoleID( ctxt.Agent.ID,   mode.Agent)
    if(ctxt.Arbiter && ctxt.Arbiter.ID) arbiter = cache.GetByRoleID( ctxt.Arbiter.ID, mode.Arbiter)
      
    let to = []
    switch(alert)
    {
      case alerts.NewOrder   : to = [ ...client, ...seller                       ]; break
      case alerts.Accepted   : to = [ ...client, ...seller,           ...arbiter ]; break      
      case alerts.NewTransit : to = [                       ...agent             ]; break   
      case alerts.AgentReady : to = [ ...client, ...seller                       ]; break         
      case alerts.Cancelled  : to = [            ...seller, ...agent             ]; break
      case alerts.Rejected   : to = [ ...client,            ...agent, ...arbiter ]; break
      case alerts.NoAgents   : to = [                                 ...arbiter ]; break
      case alerts.Terminated : to = [ ...client, ...seller, ...agent, ...arbiter ]; break
      case alerts.Assigned   : to = [ ...client, ...seller, ...agent             ]; break
      case alerts.Processed  : to = [ ...client,            ...agent             ]; break
      case alerts.EnRoute    : to = [ ...client,            ...agent             ]; break
      case alerts.Delivered  : to = [ ...client, ...seller,            ...arbiter]; break      
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
        Log('no-live-end-points-emission-dropped', Ind)
        return
    }
    Log('emit-message', Ind)

    await Channel.to(Ind.To).emit('Event', Ind.Msg) 
  } 
  catch(err)  { Log('emission-failed', err)        }

}

module.exports = { Emit, SetChannel }