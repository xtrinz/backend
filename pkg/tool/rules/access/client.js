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
                  [mode.Client]   : true
                , [mode.Agent]  : true
                , [mode.Seller]  : false
                , [mode.Arbiter]  : false
                , [mode.Enabled]: false
            }
            , [task.ReadOTP]  : 
            { 
                  [mode.Client]   : true
                , [mode.Agent]  : true
                , [mode.Seller]  : false
                , [mode.Arbiter] 	: false
                , [mode.Enabled]: false
            }
            , [task.Register] : 
            { 
                  [mode.Client]   : true
                , [mode.Agent]  : true
                , [mode.Seller]  : false
                , [mode.Arbiter] 	: false
                , [mode.Enabled]: true
                , [states.State]: [ states.MobConfirmed ]
            }
            , [task.Enabled] : true        
        }
    }
    , [verb.edit]      :
    {
          [method.put]    : 
        { 
                [mode.Client]   : true
            , [mode.Agent]  : true
            , [mode.Seller]  : false
            , [mode.Arbiter] 	: false
            , [mode.Enabled]: true
            , [task.Enabled]: false                    
        }
    }                
    , [verb.view]      :
    {
          [method.get]    : 
        { 
              [mode.Client]     : true
            , [mode.Agent]    : true
            , [mode.Seller]    : false
            , [mode.Arbiter] 	  : false
            , [mode.Enabled]  : true
            , [task.Enabled]  : false        
        } 
    }                    
}