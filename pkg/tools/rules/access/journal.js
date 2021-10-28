const {   verb, task, method
    , mode, states }    = require('../../../system/models')

module.exports = 
{
    [verb.list]         :
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
  , [verb.view]         :
    {
        [method.get]    : 
        {
          [mode.User]   : true
        , [mode.Agent]  : true
        , [mode.Store]  : true
        , [mode.Admin]  : true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  }