const {   verb, task, method
    , mode, states }    = require('../../../sys/models')

module.exports = 
{
    [verb.view]         :
    {
        [method.get]    : 
        { 
          [mode.Client]   : true
        , [mode.Agent]  : true
        , [mode.Seller]  : true
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.set]       :
    {
        [method.post]   : 
        { 
          [mode.Client]   : false
        , [mode.Agent]  : false
        , [mode.Seller]  : false
        , [mode.Arbiter] 	: true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
}