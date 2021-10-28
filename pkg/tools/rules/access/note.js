const {   verb, task, method
    , mode, states }    = require('../../../system/models')

module.exports = 
{
    [verb.view]         :
    {
        [method.get]    : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : true
        , [mode.Store]  : true
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.set]       :
    {
        [method.post]   : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
}