const event        = require('../event/address')
    , { TestCase } = require("../../lib/driver")
    , { AddUser }  = require('./user')

const Std = function(addr_, user_)
{
        let tc = new TestCase('Address Management')
            tc = AddUser(tc, user_)
    const addr =
    [
          new event.Add    (user_, addr_)
        , new event.View   (user_, addr_)
        , new event.List   (user_, addr_)
        , new event.Update (user_, addr_)
        , new event.Remove (user_, addr_)
        , new event.Add    (user_, addr_)
    ]
    addr.forEach((step) => tc.AddStep(step))             
    return tc
}

module.exports = 
{
    Std     : Std
}