const event                                = require('../event/transit')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(transit)
{
    let tc     = new TestCase('Transit Events')
//  let step01 = new event.Insert(transit)         ; tc.AddStep(step01)
    return tc
}

module.exports = 
{
    Std     : Std
}