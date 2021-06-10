const event                                = require('../event/transit')
    , { TestCase }                         = require("../../lib/driver")

const Std = function(transit)
{
    let tc    = new TestCase('Transit Events')
    let steps =
    [
          new event.StoreAccept   (transit)
        , new event.AgentAccept   (transit)
        , new event.StoreDespatch (transit)
        , new event.AgentComplete (transit)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports =
{
    Std     : Std
}