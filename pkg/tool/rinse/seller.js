const { verb, states, mode, limits } = require('../../sys/models')

module.exports =
{
    [verb.list]:
    { 
        [mode.Client] : function(data)
        {
            for(let idx = 0; idx < data.length; idx++)
            {
                data[idx].SellerID = data[idx]._id
                delete data[idx]._id    

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
        , [mode.Arbiter] : function(data)
        {            
            for(let idx = 0; idx < data.length; idx++)
            {
                data[idx].SellerID = data[idx]._id
                delete data[idx]._id

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
                delete data[idx].ClosingTime
            }
        }
    }

    , [verb.view]: 
    {
        [mode.Client] : function(seller_)
        {
            let data =
            {
                SellerID     : seller_._id
              , Name        : seller_.Name
              , Image       : seller_.Image
              , Description : seller_.Description              
              , Certs       : seller_.Certs
              , Type        : seller_.Type
              , Address     : seller_.Address
              , ClosingTime : seller_.ClosingTime
            }
            
            delete data.Address.Location

            let now_ = new Date()
            if(now_.is_below(seller_.ClosingTime))
            {
                if(!now_.is_today(seller_.Status.SetOn) ||
                    now_.diff_in_m(seller_.ClosingTime)  < limits.CheckoutGracePeriod)
                { data.Status = states.Closed            }
                else
                { data.Status = seller_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }
        , [mode.System] : function(seller_)
        {
            let data =
            {
                SellerID     : seller_._id
              , Name        : seller_.Name
              , MobileNo    : seller_.MobileNo
              , Image       : seller_.Image
              , Description : seller_.Description              
              , Certs       : seller_.Certs
              , Type        : seller_.Type
              , Address     : seller_.Address
              , ClosingTime : seller_.ClosingTime
            }

            data.Address.Longitude = seller_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = seller_.Address.Location.coordinates[1].toFixed(6)
            delete data.Address.Location

            let now_ = new Date()
            if(now_.is_below(seller_.ClosingTime))
            {
                if(!now_.is_today(seller_.Status.SetOn) ||
                    now_.diff_in_m(seller_.ClosingTime)  < limits.CheckoutGracePeriod)
                { data.Status = states.Closed            }
                else
                { data.Status = seller_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }
        , [mode.Arbiter] : function(seller_)
        {            
            let data =
            {
                SellerID     : seller_._id
              , Email       : seller_.Email
              , State       : seller_.State
              , Image       : seller_.Image
              , Certs       : seller_.Certs
              , Description : seller_.Description
              , Type        : seller_.Type
              , Name        : seller_.Name
              , MobileNo    : seller_.MobileNo
              , Address     : seller_.Address
              , ClosingTime : seller_.ClosingTime
              , Text        : seller_.Text              
            }

            data.Address.Longitude = seller_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = seller_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_below(seller_.ClosingTime))
            {
                if(!now_.is_today(seller_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = seller_.Status.Current }
            }
            else { data.Status = states.Closed }
            return data
        }       
 
        , [mode.Seller] : function(seller_)
        {
            let data =
            {
                SellerID     : seller_._id
              , Email       : seller_.Email
              , State       : seller_.State
              , Image       : seller_.Image
              , Certs       : seller_.Certs
              , Description : seller_.Description
              , Type        : seller_.Type
              , Name        : seller_.Name
              , MobileNo    : seller_.MobileNo
              , Address     : seller_.Address
              , ClosingTime : seller_.ClosingTime
              , Text        : seller_.Text                            
            }


            data.Address.Longitude = seller_.Address.Location.coordinates[0].toFixed(6)
            data.Address.Latitude  = seller_.Address.Location.coordinates[1].toFixed(6)

            delete data.Address.Location
            
            let now_ = new Date()
            if(now_.is_below(seller_.ClosingTime))
            {
                if(!now_.is_today(seller_.Status.SetOn)) 
                { data.Status = states.Closed            }
                else
                { data.Status = seller_.Status.Current }
            }
            else { data.Status = states.Closed }

            return data
        }                
    }
}