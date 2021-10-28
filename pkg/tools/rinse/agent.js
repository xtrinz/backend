const { verb } = require('../../system/models')

module.exports =
{
    [verb.list]: function(data)
    {
        console.log('rinse-agent-details', { Data: data })
        let now_               = new Date()
        for(let idx = 0; idx < data.length; idx++)
        {
            data[idx].AgentID = data[idx]._id
            delete data[idx]._id

            data[idx].Longitude = data[idx].Location.coordinates[0].toFixed(6)
            data[idx].Latitude  = data[idx].Location.coordinates[1].toFixed(6)

            delete data[idx].Location

            if(!now_.is_today(data[idx].Status.SetOn)) 
            { data[idx].Status = states.OffDuty       }
            else
            { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
        }
    }
}