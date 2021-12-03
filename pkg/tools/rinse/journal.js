const { verb, mode } = require('../../system/models')

module.exports =
{
    [verb.list]:
    {
        [mode.Admin]: function(data_)
        {
            let penalty, income
            for(let idx = 0; idx < data_.length; idx++)
            {
                data_[idx].JournalID = data_[idx]._id
                delete data_[idx]._id
                penalty        = data_[idx].Account.In.Static.Penalty
                income         = data_[idx].Account.Out.Dynamic.Refund.Buyer
        
                delete data_[idx].Account
                data_[idx].Penalty   = penalty
                data_[idx].Refund    = income 
            }            
        }
        , [mode.User]: function(data_)
        {
            for(let idx = 0; idx < data_.length; idx++)
            {
              data_[idx].JournalID = data_[idx]._id
              delete data_[idx]._id
            }
            /*
            let penalty, income            
            for(let idx = 0; idx < data_.length; idx++)
            {
                data_[idx].JournalID = data_[idx]._id
                delete data_[idx]._id
                penalty        = data_[idx].Account.In.Static.Penalty
                income         = data_[idx].Account.Out.Dynamic.Refund.Buyer
        
                delete data_[idx].Account
                data_[idx].Penalty   = penalty
                data_[idx].Refund    = income 
            } */
        }
        , [mode.Store]: function(data_)
        {
            let penalty, income
            for(let idx = 0; idx < data_.length; idx++)
            {
            data_[idx].JournalID = data_[idx]._id
            delete data_[idx]._id
            penalty   = data_[idx].Account.In.Static.Penalty.Store
            income    = data_[idx].Account.Out.Static.Payout.Store

            delete data_[idx].Account
            data_[idx].Penalty = penalty
            data_[idx].Income  = income 
            }
        }
        , [mode.Agent]: function(data_)
        {
            let penalty, income
            for(let idx = 0; idx < data_.length; idx++)
            {
            data_[idx].JournalID = data_[idx]._id
            delete data_[idx]._id
            penalty   = data_[idx].Account.In.Static.Penalty.Agent
            income    = data_[idx].Account.Out.Static.Payout.Agent

            delete data_[idx].Account
            data_[idx].Penalty = penalty
            data_[idx].Income  = income              
            }
        }
    }

    , [verb.view]: 
    {
        [mode.Admin]: function(data_)
        {
            data_.JournalID = data_._id
            delete data_._id
            let penalty   = data_.Account.In.Static.Penalty
            let income    = data_.Account.Out.Dynamic.Refund.Buyer
    
            delete data_.Account
            data_.Penalty   = penalty
            data_.Refund    = income
        }
        , [mode.User]: function(data_)
        {
            data_.JournalID = data_._id
            delete data_._id

            data_.Payment.TimeStamp = data_.Payment.Time.Webhook
            delete data_.Payment.Time            
        }
        , [mode.Store]: function(data_)
        {
            data_.JournalID = data_._id
            delete data_._id
            let penalty   = data_.Account.In.Static.Penalty.Store
            let income    = data_.Account.Out.Static.Payout.Store
  
            delete data_.Account
            data_.Penalty = penalty
            data_.Income  = income
        }
        , [mode.Agent]: function(data_)
        {
            data_.JournalID = data_._id
            delete data_._id
            let penalty   = data_.Account.In.Static.Penalty.Agent
            let income    = data_.Account.Out.Static.Payout.Agent

            delete data_.Account
            data_.Penalty = penalty
            data_.Income  = income
        }        
    }
}