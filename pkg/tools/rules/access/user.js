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
                  [mode.User]   : true
                , [mode.Agent]  : true
                , [mode.Store]  : false
                , [mode.Admin]  : false
                , [mode.Enabled]: false
            }
            , [task.ReadOTP]  : 
            { 
                  [mode.User]   : true
                , [mode.Agent]  : true
                , [mode.Store]  : false
                , [mode.Admin] 	: false
                , [mode.Enabled]: false
            }
            , [task.Register] : 
            { 
                  [mode.User]   : true
                , [mode.Agent]  : true
                , [mode.Store]  : false
                , [mode.Admin] 	: false
                , [mode.Enabled]: true
                , [states.State]: [ states.MobConfirmed ]
            }
            , [task.Enabled] : true        
        }
    }
    , [verb.profile]      :
    {
          [method.put]    : 
        { 
                [mode.User]   : true
            , [mode.Agent]  : true
            , [mode.Store]  : false
            , [mode.Admin] 	: false
            , [mode.Enabled]: true
            , [task.Enabled]: false                    
        }
        , [method.get]    : 
        { 
              [mode.User]     : true
            , [mode.Agent]    : true
            , [mode.Store]    : false
            , [mode.Admin] 	  : false
            , [mode.Enabled]  : true
            , [task.Enabled]  : false        
        } 
    }                
}