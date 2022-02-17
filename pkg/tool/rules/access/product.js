const {   verb, task, method
    , mode }    = require('../../../sys/models')

module.exports = 
{
    [verb.add]          :
    {
        [method.post]   : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
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
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: true
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
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.modify]       :
    {
        [method.put]   : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.remove]       :
    {
        [method.delete] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
}