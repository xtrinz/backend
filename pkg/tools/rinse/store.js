const { verb, states, mode, limits } = require('../../system/models')

module.exports =
{
    [verb.list]: function(data)
    {
        for(let idx = 0; idx < data.length; idx++)
        {
            data[idx].StoreID = data[idx]._id
            delete data[idx]._id    
            let now_               = new Date()        
            if(now_.is_now(data[idx].Time.Open, data[idx].Time.Close))
            {
                if(!now_.is_today(data[idx].Status.SetOn) ||
                    now_.diff_in_m(data[idx].Time.Close)  < limits.CheckoutGracePeriod)
                { data[idx].Status = states.Closed            }
                else
                { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
            }
            else { data[idx].Status = states.Closed }
        }
    }

    , [verb.view]: 
    {
        [mode.User] : function(data, store_)
        {
            delete data.Address.Location

            let now_ = new Date()
            if(now_.is_now(store_.Time.Open, store_.Time.Close))
            {
                if(!now_.is_today(store_.Status.SetOn) ||
                    now_.diff_in_m(store_.Time.Close)  < limits.CheckoutGracePeriod)
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }
        }

        , [mode.Admin] : function(data, store_)
        {
            data.Address.Longitude = store_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = store_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_now(store_.Time.Open, store_.Time.Close))
            {
                if(!now_.is_today(store_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }
        }       
 
        , [mode.Store] : function(data, store_)
        {
            data.Address.Longitude = store_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = store_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_now(store_.Time.Open, store_.Time.Close))
            {
                if(!now_.is_today(store_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }
        }                
    }
}