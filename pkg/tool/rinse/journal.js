const { verb, mode } = require('../../sys/models')

// TODO Set Earnings 

module.exports =
{
    [verb.list]:
    {
        [mode.Arbiter]: function(data_)
        {

            for(let idx = 0; idx < data_.length; idx++)
            {

                data_[idx].JournalID = data_[idx]._id
                delete data_[idx]._id

            }            
        }
        , [mode.Client]: function(data_)
        {
            for(let idx = 0; idx < data_.length; idx++)
            {

              data_[idx].JournalID = data_[idx]._id
              delete data_[idx]._id

            }

        }
        , [mode.Seller]: function(data_)
        {

            for(let idx = 0; idx < data_.length; idx++)
            {

                data_[idx].JournalID = data_[idx]._id
                delete data_[idx]._id
        
            }
        }
        , [mode.Agent]: function(data_)
        {

            for(let idx = 0; idx < data_.length; idx++)
            {

                data_[idx].JournalID = data_[idx]._id
                delete data_[idx]._id
    
            }
        }
    }

    , [verb.view]: 
    {
        [mode.Arbiter]: function(data_)
        {

            data_.JournalID = data_._id
            delete data_._id
            
        }
        , [mode.Client]: function(data_)
        {

            data_.JournalID = data_._id
            delete data_._id

            data_.Payment.TimeStamp = data_.Payment.Time.Webhook
            delete data_.Payment.Time            
        }
        , [mode.Seller]: function(data_)
        {
 
            data_.JournalID = data_._id
            delete data_._id
 
        }
        , [mode.Agent]: function(data_)
        {
 
            data_.JournalID = data_._id
            delete data_._id
 
        }        
    }
}