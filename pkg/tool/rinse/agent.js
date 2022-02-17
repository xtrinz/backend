const { verb, states } = require('../../sys/models')
, Log                     = require('../../sys/log')

module.exports =
{
    [verb.list]: function(data)
    {
        Log('rinse-agent-list', { Data: data })
        let now_               = new Date()
        for(let idx = 0; idx < data.length; idx++)
        {
            data[idx].AgentID = data[idx]._id
            delete data[idx]._id

            if(!now_.is_today(data[idx].Status.SetOn)) 
            { data[idx].Status = states.OffDuty       }
            else
            { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
        }
    }
    , [verb.view]: function(in_)
    {
        Log('rinse-agent-data', { Data: in_ })
        let now_ = new Date()
        if(!now_.is_today(in_.Status.SetOn))
        { in_.Status = states.OffDuty      }
        else
        {
          in_.Status = in_.Status.Current
          /* No action: set state as set by seller */
        }
    }    
}