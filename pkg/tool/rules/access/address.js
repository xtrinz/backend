const {   verb, task, method
    , mode, states }    = require('../../../sys/models')

module.exports = 
{
    [verb.add]          :
    {
        [method.post]   : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.list]         :
    {
        [method.get]    : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.view]         :
    {
        [method.get]    : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.modify]       :
    {
        [method.put]   : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.remove]       :
    {
        [method.delete] : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
}