const view         = require('./view')
    , list         = require('./list')
    , { TestCase } = require('../../lib/driver')

    , Std = function(journal_)
{
    let tc       = new TestCase('Journal')
    let journal =
    [
        new view.User  (journal_)
      , new view.Agent (journal_)
      , new view.Store (journal_)
      , new view.Admin (journal_)
      , new list.User  (journal_)
      , new list.Agent (journal_)
      , new list.Store (journal_)
      , new list.Admin (journal_)
    ]
    journal.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = { Std }