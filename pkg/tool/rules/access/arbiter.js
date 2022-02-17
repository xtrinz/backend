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
        , [mode.Seller]  : false
        , [mode.Arbiter]  : true
        , [mode.Enabled]: false
        }
      , [task.ReadOTP]  : 
      { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: false
      }
      , [task.Register] : 
      { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
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
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled]: false    
        , [states.State]: [ states.Registered ]               
        }
    }    
    , [verb.view]      :      
    {
        [method.get]    : 
      { 
        [mode.Client]     : false
      , [mode.Agent]    : false
      , [mode.Seller]    : false
      , [mode.Arbiter] 	  : true
      , [mode.Enabled]  : true
      , [task.Enabled]  : false        
      }         
    }            
}