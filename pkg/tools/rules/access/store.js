const {   verb, task, method
    , mode, states }    = require('../../../system/models')

module.exports = 
{
    [verb.register]     :
    {
        [method.post]     : 
        { 
        [task.New]      : 
        { 
            [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: false
        }
        , [task.ReadOTP]  : 
        { 
        [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : true
        , [mode.Admin] 	  : false
        , [mode.Enabled]  : false
        }
        , [task.Register] : 
        { 
            [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [states.State]: [ states.MobConfirmed ]
        }
        , [task.Approve]  : 
        { 
        [mode.User]     : false
        , [mode.Agent]    : false
        , [mode.Store]    : false
        , [mode.Admin] 	  : true
        , [mode.Enabled]  : true
        }
        , [task.Enabled] : true        
        }                    
    }
    , [verb.view]         :
    {
        [method.get]    : 
        { 
            [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false          
        }                     
    }
    , [verb.list]         :
    {
        [method.get]    : 
        { 
            [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false          
        }                                         
    }
    , [verb.edit]         :
    {
        [method.put]    : 
        { 
            [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled]: false
        , [states.State]: [ states.ToBeApproved
                            , states.Registered
                            , states.ToBeCorrected ]
        }                                         
    }                
}