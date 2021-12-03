const { verb, states, mode } = require('../../system/models')
    , { ObjectId }           = require('mongodb')

module.exports =
{
    [verb.list]:
    {
        [mode.Admin]: function(data, in_)
        {
            let query_ = 
            { '$or':
              [
                  {  'Admin.ID' : in_._id }
                , { 'Admins.ID' : in_._id }
              ]
            }
            
            if((data.IsLive !== undefined) && (data.IsLive == true))
            query_[ 'Transit.Status' ] = states.Running
            else if (data.IsLive !== undefined)
            query_[ 'Transit.Status' ] = states.Closed

            return query_
        }
        , [mode.User]: function(data, in_)
        {
            let query_ = 
            {
                'Buyer.ID'       : ObjectId(in_._id)
              , 'Payment.Status' : { $nin: [ states.Initiated, states.Failed ] }
            }
            
            if((data.IsLive !== undefined) && (data.IsLive == true))
            query_[ 'Transit.Status' ] = states.Running
            else if (data.IsLive !== undefined)
            query_[ 'Transit.Status' ] = states.Closed

            return query_            
        }
        , [mode.Store]: function(data, in_)
        {
            let query_ = 
            {
                'Store.ID'      : ObjectId(in_._id)
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
        [mode.Admin]: function(data, in_)
        {
            return {
                _id         : ObjectId(data.JournalID)
            }   
        }
        , [mode.User]: function(data, in_)
        {
            return { 
                _id        : ObjectId(data.JournalID)
              , 'Buyer.ID' : ObjectId(in_._id)
            }
        }
        , [mode.Store]: function(data, in_)
        {
            return {
                _id         : ObjectId(data.JournalID)
              , 'Store.ID' : ObjectId(in_._id)
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