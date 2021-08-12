const event        = require('./event')
    , { TestCase } = require('../../lib/driver')

    , Std = function(journal_, owner_, user_, agent_, admin_)
{
    let tc     = new TestCase('Journal')
    let journal =
    [
          new event.Read   (journal_, owner_)
        , new event.Read   (journal_, user_)
        , new event.Read   (journal_, agent_)
        , new event.Read   (journal_, admin_)

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