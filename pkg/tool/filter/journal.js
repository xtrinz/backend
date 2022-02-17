const { verb, states, mode } = require('../../sys/models')
    , { ObjectId }           = require('mongodb')

module.exports =
{
    [verb.list]:
    {
        [mode.Arbiter]: function(data, in_)
        {
            let query_ = {}

            if(data.SellerUID     != undefined)   query_[  'Seller.MobileNo' ] = data.SellerUID
            if(data.ClientUID     != undefined)   query_[  'Client.MobileNo' ] = data.ClientUID
            if(data.AgentUID      != undefined)   query_[   'Agent.MobileNo' ] = data.AgentUID
            if(data.ArbiterUID    != undefined)   query_[   'Agent.MobileNo' ] = data.ArbiterUID                
            if(data.PaymentStatus != undefined)   query_[ 'Payment.Status'   ] = data.PaymentStatus
            if(data.TransitStatus != undefined)   query_[ 'Transit.Status'   ] = data.TransitStatus
            if(data.TransitState  != undefined)   query_[ 'Transit.State'    ] = data.TransitState

            if(Object.keys(query_).length == 0) 
            query_ = { 'Arbiter.ID' : in_._id }

            return query_

        }
        , [mode.Client]: function(data, in_)
        {
            let query_ = 
            {
                'Client.ID'       : ObjectId(in_._id)
              , 'Payment.Status' : { $nin: [ states.Initiated, states.Failed ] }
            }
            
            if((data.IsLive !== undefined) && (data.IsLive == true))
            query_[ 'Transit.Status' ] = states.Running
            else if (data.IsLive !== undefined)
            query_[ 'Transit.Status' ] = states.Closed

            return query_            
        }
        , [mode.Seller]: function(data, in_)
        {
            let query_ = 
            {
                'Seller.ID'      : ObjectId(in_._id)
              , 'Payment.Status' : { $nin: [ states.Initiated, states.Failed ] }
            }
            
            if((data.IsLive !== undefined) && (data.IsLive == true))
            query_[ 'Transit.Status' ] = states.Running
            else if (data.IsLive !== undefined)
            query_[ 'Transit.Status' ] = states.Closed

            return query_            
        }
        , [mode.Agent]: function(data, in_)
        {
            let query_ = 
            {
                'Agent.ID'       : ObjectId(in_._id)
            }
            
            if((data.IsLive !== undefined) && (data.IsLive == true))
            query_[ 'Transit.Status' ] = states.Running
            else if (data.IsLive !== undefined)
            query_[ 'Transit.Status' ] = states.Closed

            return query_            
        }
    }

    , [verb.view]: 
    {
        [mode.Arbiter]: function(data, in_)
        {
            return {
                _id         : ObjectId(data.JournalID)
            }   
        }
        , [mode.Client]: function(data, in_)
        {
            return { 
                _id        : ObjectId(data.JournalID)
              , 'Client.ID' : ObjectId(in_._id)
            }
        }
        , [mode.Seller]: function(data, in_)
        {
            return {
                _id         : ObjectId(data.JournalID)
              , 'Seller.ID' : ObjectId(in_._id)
            }
        }
        , [mode.Agent]: function(data, in_)
        {
            let query_ = { 'Agent.ID' : ObjectId(in_._id) }

            if(data.JournalID) query_._id = ObjectId(data.JournalID)
            if((data.IsLive !== undefined) && (data.IsLive == true))
            {
              query_[ 'Transit.Status' ] = states.Running
            }

            return query_
        }
    }
}