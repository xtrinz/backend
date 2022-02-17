const view         = require('./view')
    , list         = require('./list')
    , { TestCase } = require('../../../lib/driver')

    , Std = function(journal_)
{
    let tc       = new TestCase('Journal')
    let journal = []
    /*
    [
        new view.Client  (journal_)
      , new view.Agent (journal_)
      , new view.Seller (journal_)
      , new view.Arbiter (journal_)
      , new list.Client  (journal_)
      , new list.Agent (journal_)
      , new list.Seller (journal_)
      , new list.Arbiter (journal_)
    ]*/
    journal.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = { Std }