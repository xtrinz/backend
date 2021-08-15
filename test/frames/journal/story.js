const event        = require('./event')
    , { TestCase } = require('../../lib/driver')
    , { source }   = require('../../../pkg/common/models')

    , Std = function(user_)
{
    let cart_  = user_
    let tc     = new TestCase('Journal')
    let journal =
    [
          new event.View   (user_, user_, cart_, source.User)
    //  , new event.View   (journal_, user_)
    //  , new event.View   (journal_, agent_)
    //  , new event.View   (journal_, admin_)

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