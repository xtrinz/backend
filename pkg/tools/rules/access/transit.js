const {   verb, task, method
    , mode, states }    = require('../../../system/models')

module.exports = 
{
    [verb.user]         :
    {
      [method.post]     : 
      {
          [task.Cancel] : 
        { 
          [mode.User]   : true
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true          
      }
    }
  , [verb.store]        :
    {
      [method.post]     :
      {
          [task.Reject] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Accept] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Despatch] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : true
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true          
      }
    }
  , [verb.agent]        :
    {
      [method.post]     : 
      { 
        [task.ResendOTP]: 
        {
          [mode.User]   : false
        , [mode.Agent]  : true
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Reject] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : true
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Ignore] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : true
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Accept] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : true
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Complete] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : true
        , [mode.Store]  : false
        , [mode.Admin] 	: false
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true          
      }
    }
  , [verb.admin]        :
    {
      [method.post]     : 
      { 
        [task.Accept]   : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        }
        , [task.Assign] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        }
        , [task.Termiate] : 
        { 
          [mode.User]   : false
        , [mode.Agent]  : false
        , [mode.Store]  : false
        , [mode.Admin] 	: true
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true
      }
    }
  }