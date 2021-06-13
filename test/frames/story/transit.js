const event        = require('../event/transit')
    , { TestCase } = require("../../lib/driver")
    , { AddUser }  = require('./user')

const Std = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Transit Process')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (owner_)
        , new event.NewOrder       (staff_)
        , new event.NewOrder       (user_)

        , new event.StoreAccept   (staff_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ )
        
        , new event.AgentAccept   (agent_, staff_)
        , new event.AgentReady    (user_)
        , new event.AgentReady    (owner_)
        , new event.AgentReady    (staff_)
        
        , new event.StoreDespatch (staff_, agent_)
        , new event.EnRoute       (user_)        
        , new event.EnRoute       (agent_)

        , new event.AgentComplete (agent_)
        , new event.Delivered     (user_)
        , new event.Delivered     (owner_)
        , new event.Delivered     (staff_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports =
{
    Std     : Std
}