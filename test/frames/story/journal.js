const event        = require('../event/journal')
    , { TestCase } = require("../../lib/driver")

const Std = function(product_, cart_, addr_)
{
    let tc     = new TestCase('Address Management')
    let step01 = new event.Create(product_, cart_, addr_) ; tc.AddStep(step01)               
    return tc
}

module.exports = 
{
    Std     : Std
}