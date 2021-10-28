const event        = require('./event')
    , { TestCase } = require('../../lib/driver')
    , { AddUser }  = require('../user/story')
    , { Obj }      = require('../data')

const Std = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Transit Process')
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_, false) // !COD
        , new event.ConfirmPayment (cart_)
        , new event.NewOrder       (store_, Obj.Store)
        , new event.NewOrder       (user_, Obj.User)

        , new event.StoreAccept   (store_, agent_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)
        
        , new event.AgentAccept   (agent_, store_)
        , new event.AgentReady    (user_, Obj.User)
        , new event.AgentReady    (store_, Obj.Store)
        
        , new event.StoreDespatch (store_, agent_)
        , new event.EnRoute       (user_, Obj.User)        
        , new event.EnRoute       (agent_, Obj.Agent)
        
        , new event.AgentComplete (agent_)
        , new event.Delivered     (user_, Obj.User)
        , new event.Delivered     (store_, Obj.Store)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const COD = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Transit Process')
    let steps =
    [
          new event.Checkout      (user_, addr_, cart_, true) // COD
        , new event.NewOrder      (store_, Obj.Store)
        , new event.NewOrder      (user_, Obj.User)

        , new event.StoreAccept   (store_, agent_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)
        
        , new event.AgentAccept   (agent_, store_)
        , new event.AgentReady    (user_, Obj.User)
        , new event.AgentReady    (store_, Obj.Store)
        
        , new event.StoreDespatch (store_, agent_)
        , new event.EnRoute       (user_, Obj.User)        
        , new event.EnRoute       (agent_, Obj.Agent)
        
        , new event.AgentComplete (agent_)
        , new event.Delivered     (user_, Obj.User)
        , new event.Delivered     (store_, Obj.Store)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelByUser = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Init')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (store_)
        , new event.NewOrder       (user_)

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (store_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelByUserAfterAceptance = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Store Accepted The Order')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (store_)
        , new event.NewOrder       (user_)
        
        , new event.StoreAccept   (store_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (store_)
        , new event.Cancelled      (agent_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelByUserAfterTransitAceptance = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancellation By User After Agent Accepted The Transit')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (store_)
        , new event.NewOrder       (user_)
        
        , new event.StoreAccept   (store_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)

        , new event.AgentAccept   (agent_, store_)
        , new event.AgentReady    (user_)
        , new event.AgentReady    (store_)

        , new event.CancelByUser   (user_ )
        , new event.Cancelled      (agent_)
        , new event.Cancelled      (store_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterInit = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Init')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (store_)
        , new event.NewOrder        (user_)

        , new event.RejectedByStore (store_)
        , new event.Rejected        (user_ )
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterOrderAcceptance = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Accepting the order')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (store_)
        , new event.NewOrder        (user_)

        , new event.StoreAccept   (store_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)

        , new event.RejectedByStore (store_)
        , new event.Rejected        (user_ )
        , new event.Rejected        (agent_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancellationByStoreAfterTransitAcceptance = function(user_, addr_, agent_, store_)
{
    let cart_   = user_
    let tc      = new TestCase('Cancelled By Store After Accepting the Transit')
        tc      = AddUser(tc, agent_)
    let steps =
    [
/*          new event.Checkout        (user_, addr_, cart_)
        , new event.ConfirmPayment  ()
        , new event.NewOrder        (store_)
        , new event.NewOrder        (user_)

        , new event.StoreAccept   (store_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)
        
        , new event.AgentAccept   (agent_, store_)
        , new event.AgentReady    (user_)
        , new event.AgentReady    (store_)

        , new event.RejectedByStore (store_)
        , new event.Rejected        (user_ )
        , new event.Rejected        (agent_)*/
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const IgnoredByLastAgent = function(user_, addr_, agent_, store_, admin_)
{
    let cart_   = user_
    let tc      = new TestCase('Ignored by last agent')
        tc      = AddUser(tc, agent_)
    let steps =
    [
          new event.Checkout       (user_, addr_, cart_)
        , new event.ConfirmPayment ()
        , new event.NewOrder       (store_)
        , new event.NewOrder       (user_)

        , new event.StoreAccept    (store_)
        , new event.NewTransit     (agent_)
        , new event.Accepted      (user_ , Obj.User)
        , new event.Accepted      (store_, Obj.Store)

        , new event.AgentIgnore    (agent_)
        , new event.NoAgents       (admin_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports =
{
      Std                                       : Std
    , COD                                       : COD
    , CancelByUser                              : CancelByUser
    , CancelByUserAfterAceptance                : CancelByUserAfterAceptance
    , CancelByUserAfterTransitAceptance         : CancelByUserAfterTransitAceptance
    , CancellationByStoreAfterInit              : CancellationByStoreAfterInit
    , CancellationByStoreAfterOrderAcceptance   : CancellationByStoreAfterOrderAcceptance
    , CancellationByStoreAfterTransitAcceptance : CancellationByStoreAfterTransitAcceptance
    , IgnoredByLastAgent                        : IgnoredByLastAgent
}