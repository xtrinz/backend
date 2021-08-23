const event        = require('./event')
    , { TestCase } = require('../../lib/driver')
    , { source }   = require('../../../pkg/common/models')

    , Std = function(user_, owner_, agent_, admin_)
{
    let cart_    = user_
    let journal_ = user_
    let tc       = new TestCase('Journal')
    let journal =
    [
//        new event.View (journal_,  user_, cart_, source.User, agent_ )
//      , new event.View (journal_, owner_, cart_, source.Store, agent_)
//      , new event.View (journal_, agent_, cart_, source.Agent)

      , new event.View (journal_, user_, owner_, agent_, cart_, admin_, source.User)
      , new event.View (journal_, user_, owner_, agent_, cart_, admin_, source.Store)
      , new event.View (journal_, user_, owner_, agent_, cart_, admin_, source.Agent)
      , new event.View (journal_, user_, owner_, agent_, cart_, admin_, source.Admin)      
//      , new event.View (journal_, admin_, cart_, source.Admin)

      /*, new event.List   (owner_)
        , new event.List   (user_)
        , new event.List   (agent_)
        , new event.List   (admin_)*/                        
    ]
    journal.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}