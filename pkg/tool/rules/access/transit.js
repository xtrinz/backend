const {   verb, task, method
    , mode, states }    = require('../../../sys/models')

module.exports = 
{
    [verb.client]         :
    {
      [method.post]     : 
      {
          [task.Cancel] : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true          
      }
    }
  , [verb.seller]        :
    {
      [method.post]     :
      {
          [task.Reject] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Accept] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Despatch] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: false
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
          [mode.Client]   : false
        , [mode.Agent]  : true
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Reject] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : true
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Ignore] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : true
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Accept] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : true
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Complete] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : true
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: false
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true          
      }
    }
  , [verb.arbiter]        :
    {
      [method.post]     : 
      { 
        [task.Accept]   : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        }
        , [task.Assign] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        }
        , [task.Terminate] : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        }
        , [task.Enabled] : true
      }
    }
  }