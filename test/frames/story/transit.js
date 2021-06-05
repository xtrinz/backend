const event                                = require('../event/transit')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(transit)
{
    let tc     = new TestCase('Transit Events')
    let step01 = new event.StoreAccept(transit)         ; tc.AddStep(step01)
    let step02 = new event.AgentAccept(transit)         ; tc.AddStep(step02)
    let step03 = new event.StoreDespatch(transit)       ; tc.AddStep(step03)
    let step04 = new event.AgentComplete(transit)       ; tc.AddStep(step04)                           
    return tc
}

module.exports =
{
    Std     : Std
}