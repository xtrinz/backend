const event        = require('./event')
    , { TestCase } = require('../../lib/driver')
    , { source }   = require('../../../pkg/system/models')

    , Std = function(user_, store_, agent_, admin_, dest_addr_)
{
    let cart_    = user_
    let journal_ = user_
    let tc       = new TestCase('Journal')
    let journal =
    [
        new event.View (journal_, user_, store_, agent_, cart_, admin_, source.User,  dest_addr_)
      //, new event.View (journal_, user_, store_, agent_, cart_, admin_, source.Store, dest_addr_)
      //, new event.View (journal_, user_, store_, agent_, cart_, admin_, source.Agent, dest_addr_)
      //, new event.View (journal_, user_, store_, agent_, cart_, admin_, source.Admin, dest_addr_)
      //
      //, new event.List (journal_, user_, store_, agent_, cart_, admin_, source.User,  dest_addr_)
      //, new event.List (journal_, user_, store_, agent_, cart_, admin_, source.Store, dest_addr_)
      //, new event.List (journal_, user_, store_, agent_, cart_, admin_, source.Agent, dest_addr_)
      //, new event.List (journal_, user_, store_, agent_, cart_, admin_, source.Admin, dest_addr_)

    ]
    journal.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports = 
{
    Std     : Std
}