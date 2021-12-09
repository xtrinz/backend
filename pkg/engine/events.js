const { alerts } = require('../system/models')
    , Log      = require('../system/logger')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Emit = async function(alert, ctxt)
{
  try         
  { 
    let to = []
    switch(alert)
    {
      case alerts.NewOrder        :

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
        ]

      break
      case alerts.Accepted        :

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
          , ...ctxt.Admin.SockID
        ]
        
      break      
      case alerts.NewTransit      :

        to =
        [
            ...ctxt.Agent.SockID
        ]

      break   
      case alerts.AgentReady      :

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
        ]
        
      break         
      case alerts.Cancelled       : 

        to =
        [
            ...ctxt.Store.SockID
          , ...ctxt.Agent.SockID
        ]

      break
      case alerts.Rejected        : 

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Agent.SockID
          , ...ctxt.Admin.SockID
        ]

      break
      case alerts.NoAgents        :

        to =
        [
          ...ctxt.Admin.SockID
        ]

      break
      case alerts.Terminated      :

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
          , ...ctxt.Agent.SockID
          , ...ctxt.Admin.SockID
        ]
        
      break
      case alerts.Assigned        :

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
          , ...ctxt.Agent.SockID
        ]
        
      break
      case alerts.Processed       : 
      
        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Agent.SockID
        ]


      break
      case alerts.EnRoute         :
      
        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Agent.SockID
        ]

  
      break
      case alerts.Delivered       : 

        to =
        [
            ...ctxt.User.SockID
          , ...ctxt.Store.SockID
          , ...ctxt.Admin.SockID
        ]

      break      
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
  catch(err)  { Log('emission-failed', err, Ind)        }

}

module.exports = { Emit, SetChannel }