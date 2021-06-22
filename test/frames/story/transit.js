const event        = require('../event/transit')
    , { TestCase } = require('../../lib/driver')
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

const CancelByUser = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Init')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (owner_)
        , new event.NewOrder       (staff_)
        , new event.NewOrder       (user_)

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (owner_)
        , new event.Cancelled      (staff_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelByUserAfterAceptance = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Store Accepted The Order')
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

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (owner_)
        , new event.Cancelled      (staff_)
        , new event.Cancelled      (agent_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelByUserAfterTransitAceptance = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Agent Accepted The Transit')
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

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (agent_)
        , new event.Cancelled      (owner_)
        , new event.Cancelled      (staff_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterInit = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Init')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (owner_)
        , new event.NewOrder        (staff_)
        , new event.NewOrder        (user_)

        , new event.RejectedByStore (staff_)
        , new event.Rejected        (user_ )
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterOrderAcceptance = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Accepting the order')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (owner_)
        , new event.NewOrder        (staff_)
        , new event.NewOrder        (user_)

        , new event.StoreAccept   (staff_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ )

        , new event.RejectedByStore (staff_)
        , new event.Rejected        (user_ )
        , new event.Rejected        (agent_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterTransitAcceptance = function(user_, addr_, agent_, owner_, staff_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Accepting the Transit')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (owner_)
        , new event.NewOrder        (staff_)
        , new event.NewOrder        (user_)

        , new event.StoreAccept   (staff_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ )
        
        , new event.AgentAccept   (agent_, staff_)
        , new event.AgentReady    (user_)
        , new event.AgentReady    (owner_)
        , new event.AgentReady    (staff_)

        , new event.RejectedByStore (staff_)
        , new event.Rejected        (user_ )
        , new event.Rejected        (agent_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const IgnoredByLastAgent = function(user_, addr_, agent_, owner_, staff_, admin_)
{
    let cart_   = user_
    let tc      = new TestCase('Ignored by last agent')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (owner_)
        , new event.NewOrder       (staff_)
        , new event.NewOrder       (user_)

        , new event.StoreAccept    (staff_)
        , new event.NewTransit     (agent_)
        , new event.Accepted       (user_ )

        , new event.AgentIgnore    (agent_)
        , new event.NoAgents       (admin_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports =
{
      Std                                       : Std
    , CancelByUser                              : CancelByUser
    , CancelByUserAfterAceptance                : CancelByUserAfterAceptance
    , CancelByUserAfterTransitAceptance         : CancelByUserAfterTransitAceptance
    , CancellationByStoreAfterInit              : CancellationByStoreAfterInit
    , CancellationByStoreAfterOrderAcceptance   : CancellationByStoreAfterOrderAcceptance
    , CancellationByStoreAfterTransitAcceptance : CancellationByStoreAfterTransitAcceptance
    , IgnoredByLastAgent                        : IgnoredByLastAgent
}