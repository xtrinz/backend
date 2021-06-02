const event        = require('../event/journal')
    , { TestCase } = require("../../lib/driver")

const Std = function(journal)
{
    let tc     = new TestCase('Address Management')
    let step01 = new event.Create(journal) ; tc.AddStep(step01)               
    return tc
}

module.exports = 
{
    Std     : Std
}