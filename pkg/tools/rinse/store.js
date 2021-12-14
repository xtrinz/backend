const { verb, states, mode, limits } = require('../../system/models')

module.exports =
{
    [verb.list]: function(data)
    {
        for(let idx = 0; idx < data.length; idx++)
        {
            data[idx].StoreID = data[idx]._id
            delete data[idx]._id    
            console.log('xyz', data[idx])
            let now_               = new Date()        
            if(now_.is_below(data[idx].ClosingTime))
            {
                if(!now_.is_today(data[idx].Status.SetOn) ||
                    now_.diff_in_m(data[idx].ClosingTime)  < limits.CheckoutGracePeriod)
                { data[idx].Status = states.Closed            }
                else
                { data[idx].Status = data[idx].Status.Current /* No action: set state as set by seller */ }
            }
            else { data[idx].Status = states.Closed }
        }
    }

    , [verb.view]: 
    {
        [mode.User] : function(store_)
        {
            let data =
            {
                StoreID     : store_._id
              , Name        : store_.Name
              , Image       : store_.Image
              , Description : store_.Description              
              , Certs       : store_.Certs
              , Type        : store_.Type
              , Address     : store_.Address
              , ClosingTime : store_.ClosingTime
            }
            
            delete data.Address.Location

            let now_ = new Date()
            if(now_.is_below(store_.ClosingTime))
            {
                if(!now_.is_today(store_.Status.SetOn) ||
                    now_.diff_in_m(store_.ClosingTime)  < limits.CheckoutGracePeriod)
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }
        , [mode.System] : function(store_)
        {
            let data =
            {
                StoreID     : store_._id
              , Name        : store_.Name
              , MobileNo    : store_.MobileNo
              , Image       : store_.Image
              , Description : store_.Description              
              , Certs       : store_.Certs
              , Type        : store_.Type
              , Address     : store_.Address
              , ClosingTime : store_.ClosingTime
            }

            data.Address.Longitude = store_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = store_.Address.Location.coordinates[1].toFixed(6)
            delete data.Address.Location

            let now_ = new Date()
            if(now_.is_below(store_.ClosingTime))
            {
                if(!now_.is_today(store_.Status.SetOn) ||
                    now_.diff_in_m(store_.ClosingTime)  < limits.CheckoutGracePeriod)
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }
        , [mode.Admin] : function(store_)
        {            
            let data =
            {
                StoreID     : store_._id
              , Email       : store_.Email
              , State       : store_.State
              , Image       : store_.Image
              , Certs       : store_.Certs
              , Description : store_.Description
              , Type        : store_.Type
              , Name        : store_.Name
              , MobileNo    : store_.MobileNo
              , Address     : store_.Address
              , ClosingTime : store_.ClosingTime
            }

            data.Address.Longitude = store_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = store_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_below(store_.ClosingTime))
            {
                if(!now_.is_today(store_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }
        }       
 
        , [mode.Store] : function(store_)
        {
            let data =
            {
                StoreID     : store_._id
              , Email       : store_.Email
              , State       : store_.State
              , Image       : store_.Image
              , Certs       : store_.Certs
              , Description : store_.Description
              , Type        : store_.Type
              , Name        : store_.Name
              , MobileNo    : store_.MobileNo
              , Address     : store_.Address
              , ClosingTime : store_.ClosingTime
            }


            data.Address.Longitude = store_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = store_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_below(store_.ClosingTime))
            {
                if(!now_.is_today(store_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = store_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }                
    }
}