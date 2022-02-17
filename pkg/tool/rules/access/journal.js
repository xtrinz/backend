const {   verb, task, method
    , mode, states }    = require('../../../sys/models')

module.exports = 
{
    [verb.list]         :
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
  , [verb.view]         :
    {
        [method.get]    : 
        {
          [mode.Client]   : true
        , [mode.Agent]  : true
        , [mode.Seller]  : true
        , [mode.Arbiter]  : true
        , [mode.Enabled]: true
        , [task.Enabled] : false          
        }
    }
  , [verb.create]        :
    {
      [method.post]    :
      {
        [mode.Client]    : true
      , [mode.Agent]   : false
      , [mode.Seller]   : false
      , [mode.Arbiter] 	 : false
      , [mode.Enabled] : true
      , [task.Enabled] : false
      }
    }
    
}