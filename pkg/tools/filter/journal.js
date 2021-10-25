const { verb, states, mode } = require('../../system/models')
    , { ObjectId }           = require('mongodb')

module.exports =
{
    [verb.list]:
    {
        [mode.Admin]: function(in_)
        {
            return { '$or': // TODO $lookup cross transit status
              [
                  {  'Admin.ID' : in_._id }
                , { 'Admins.ID' : in_._id }
              ]
            }
        }
        , [mode.User]: function(in_)
        {
            return {
                'Buyer.ID'       : ObjectId(in_._id)
              , 'Payment.Status' : { $nin: [ states.Initiated, states.Failed ] }
            }
        }
        , [mode.Store]: function(in_)
        {
            return {
                'Seller.ID'      : ObjectId(in_._id)
              , 'Payment.Status' : { $nin: [ states.Initiated, states.Failed ] }
            }
        }
        , [mode.Agent]: function(in_)
        {
            return {
                'Agent.ID'       : ObjectId(in_._id)
            }
        }
    }

    , [verb.view]: 
    {
    }
}