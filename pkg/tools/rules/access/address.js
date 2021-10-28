const {   verb, task, method
    , mode, states }    = require('../../../system/models')

module.exports = 
{
    [verb.add]          :
    {
        [method.post]   : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.list]         :
    {
        [method.get]    : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.view]         :
    {
        [method.get]    : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.modify]       :
    {
        [method.post]   : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.remove]       :
    {
        [method.delete] : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
}