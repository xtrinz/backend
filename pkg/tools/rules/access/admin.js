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
        , [mode.Store]  : false
        , [mode.Admin]  : true
        , [mode.Enabled]: false
        }
      , [task.ReadOTP]  : 
      { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: false
      }
      , [task.Register] : 
      { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
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
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false    
        , [states.State]: [ states.Registered ]               
        }
    }    
    , [verb.view]      :      
    {
        [method.get]    : 
      { 
        [mode.User]     : false
      , [mode.Agent]    : false
      , [mode.Store]    : false
      , [mode.Admin] 	  : true
      , [mode.Enabled]  : true
      , [task.Enabled]  : false        
      }         
    }            
}