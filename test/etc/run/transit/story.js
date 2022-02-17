const event        = require('./event')
    , { TestCase } = require('../../../lib/driver')
    , { Obj }      = require('../../data')

const Std = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Transit Process')
    let steps =
    [
          new event.Checkout   (client_, addr_, cart_, false) // !COD
        , new event.Confirm    (cart_)
        , new event.NewOrder   (seller_, Obj.Seller)
        , new event.NewOrder   (client_, Obj.Client)

        , new event.Accept     (seller_, agent_)
        , new event.Accepted   (client_ , Obj.Client)
        , new event.Accepted   (seller_, Obj.Seller)
        , new event.NewTransit (agent_)

        , new event.Commit     (agent_, seller_)
        , new event.AgentReady (client_, Obj.Client)
        , new event.AgentReady (seller_, Obj.Seller)

        , new event.Despatch   (seller_, agent_)
        , new event.EnRoute    (client_, Obj.Client)        
        , new event.EnRoute    (agent_, Obj.Agent)

        , new event.Done       (agent_)
        , new event.Delivered  (client_, Obj.Client)
        , new event.Delivered  (seller_, Obj.Seller)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const COD = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Transit Process')
    let steps =
    [
          new event.Checkout   (client_, addr_, cart_, true) // COD
        , new event.NewOrder   (seller_, Obj.Seller)
        , new event.NewOrder   (client_, Obj.Client)

        , new event.Accept     (seller_, agent_)
        , new event.Accepted   (client_ , Obj.Client)
        , new event.Accepted   (seller_, Obj.Seller)
        , new event.NewTransit (agent_)

        , new event.Commit     (agent_, seller_)
        , new event.AgentReady (client_, Obj.Client)
        , new event.AgentReady (seller_, Obj.Seller)

        , new event.Despatch   (seller_, agent_)
        , new event.EnRoute    (client_, Obj.Client)        
        , new event.EnRoute    (agent_, Obj.Agent)
                        
        , new event.Done       (agent_)
        , new event.Delivered  (client_, Obj.Client)
        , new event.Delivered  (seller_, Obj.Seller)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelA = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_ = client_
    let tc    = new TestCase('Cancellation By Client After Init')
    let steps =
    [
          new event.Checkout  (client_, addr_, cart_, false) // !COD
        , new event.Confirm   (cart_)
        , new event.NewOrder  (seller_, Obj.Seller)
        , new event.NewOrder  (client_, Obj.Client)

        , new event.Cancel    (client_)
        , new event.Cancelled  (seller_, Obj.Seller)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelB = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Cancellation By Client After Seller Accepted The Order')
    let steps   =
    [
          new event.Checkout  (client_, addr_, cart_, false) // !COD
        , new event.Confirm   (cart_)
        , new event.NewOrder  (seller_, Obj.Seller)
        , new event.NewOrder  (client_, Obj.Client)

        , new event.Accept     (seller_)
        , new event.Accepted   (client_, Obj.Client)
        , new event.Accepted   (seller_, Obj.Seller)
        , new event.NewTransit (agent_)

        , new event.Cancel     (client_)
        , new event.Cancelled  (seller_, Obj.Seller)
        , new event.Cancelled  (agent_, Obj.Agent)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const CancelC = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Cancellation By Client After Agent Accepted The Transit')
    let steps   =
    [
          new event.Checkout   (client_, addr_, cart_, false) // !COD
        , new event.Confirm    (cart_)
        , new event.NewOrder   (seller_, Obj.Seller)
        , new event.NewOrder   (client_, Obj.Client)
        
        , new event.Accept     (seller_)
        , new event.NewTransit (agent_)
        , new event.Accepted   (client_ , Obj.Client)
        , new event.Accepted   (seller_,  Obj.Seller)

        , new event.Commit     (agent_, seller_)
        , new event.AgentReady (client_, Obj.Client)
        , new event.AgentReady (seller_, Obj.Seller)

        , new event.Cancel     (client_ )
        , new event.Cancelled  (seller_, Obj.Seller)
        , new event.Cancelled  (agent_, Obj.Agent)        
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const RejectA = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Cancelled By Seller After Init')
    let steps =
    [
          new event.Checkout (client_, addr_, cart_, false) // !COD
        , new event.Confirm  (cart_)
        , new event.NewOrder (seller_, Obj.Seller)
        , new event.NewOrder (client_, Obj.Client)
      
        , new event.Reject   (seller_)
        , new event.Rejected (client_ , Obj.Client)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const RejectB = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Cancelled By Seller After Accepting the order')
    let steps   =
    [
          new event.Checkout   (client_, addr_, cart_, false) // !COD
        , new event.Confirm    (cart_)
        , new event.NewOrder   (seller_, Obj.Seller)
        , new event.NewOrder   (client_, Obj.Client)

        , new event.Accept     (seller_)
        , new event.NewTransit (agent_)
        , new event.Accepted   (client_ , Obj.Client)
        , new event.Accepted   (seller_, Obj.Seller)

        , new event.Reject     (seller_)
        , new event.Rejected   (client_ , Obj.Client)
        , new event.Rejected   (agent_  , Obj.Agent )
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const RejectC = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Cancelled By Seller After Accepting the Transit')
    let steps   =
    [
          new event.Checkout      (client_, addr_, cart_, false) // !COD
        , new event.Confirm       (cart_)
        , new event.NewOrder      (seller_, Obj.Seller)
        , new event.NewOrder      (client_, Obj.Client)

        , new event.Accept        (seller_)
        , new event.NewTransit    (agent_)
        , new event.Accepted      (client_ , Obj.Client)
        , new event.Accepted      (seller_,  Obj.Seller)
        
        , new event.Commit        (agent_, seller_)
        , new event.AgentReady    (client_, Obj.Client)
        , new event.AgentReady    (seller_, Obj.Seller)

        , new event.Reject        (seller_)
        , new event.Rejected      (client_ , Obj.Client)
        , new event.Rejected      (agent_  , Obj.Agent )
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

const Ignore = function(arbiter_, client_, agent_, seller_, addr_)
{
    let cart_   = client_
    let tc      = new TestCase('Ignored by last agent')
    let steps   =
    [
          new event.Checkout   (client_, addr_, cart_, false) // !COD
        , new event.Confirm    (cart_)
        , new event.NewOrder   (seller_, Obj.Seller)
        , new event.NewOrder   (client_, Obj.Client)

        , new event.Accept     (seller_)
        , new event.NewTransit (agent_)
        , new event.Accepted   (client_, Obj.Client)
        , new event.Accepted   (seller_, Obj.Seller)

        , new event.Ignore     (agent_)
        , new event.NoAgents   (arbiter_)
    ]
    steps.forEach((step) => tc.AddStep(step))
    return tc
}

module.exports =
{
      Std     , COD
    , CancelA , CancelB , CancelC
    , RejectA , RejectB , RejectC
    , Ignore
}