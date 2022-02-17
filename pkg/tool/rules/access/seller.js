const {   verb, task, method
    , mode, states }    = require('../../../sys/models')

module.exports = 
{
    [verb.register]     :
    {
        [method.post]     : 
        { 
        [task.New]      : 
        { 
            [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: false
        }
        , [task.ReadOTP]  : 
        { 
        [mode.Client]     : false
        , [mode.Agent]    : false
        , [mode.Seller]    : true
        , [mode.Arbiter] 	  : false
        , [mode.Enabled]  : false
        }
        , [task.Register] : 
        { 
            [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [states.State]: [ states.MobConfirmed ]
        }
        , [task.Approve]  : 
        { 
        [mode.Client]     : false
        , [mode.Agent]    : false
        , [mode.Seller]    : false
        , [mode.Arbiter] 	  : true
        , [mode.Enabled]  : true
        }
        , [task.Enabled] : true        
        }                    
    }
    , [verb.view]         :
    {
        [method.get]    : 
        { 
            [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false          
        }                     
    }
    , [verb.list]         :
    {
        [method.get]    : 
        { 
            [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false          
        }                                         
    }
    , [verb.edit]         :
    {
        [method.put]    : 
        { 
            [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled]: false
        , [states.State]: [ states.ToBeApproved
                            , states.Registered
                            , states.ToBeCorrected ]
        }                                         
    }                
}