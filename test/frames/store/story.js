const event        = require('./event')
    , { TestCase } = require('../../lib/driver')
    , { AddUser }  = require('../user/story')

const Std = function(admin_, owner_, staff_, store_)
{
    let tc = new TestCase('Store Management')
        tc = AddUser(tc, owner_)
    const store = 
    [
          new event.RegisterNew     (store_)            // Store
        , new event.RegisterReadOTP (owner_, store_)
        , new event.RegisterApprove (admin_, store_)
        , new event.Edit            (store_)
        , new event.Read            (owner_, store_)
        , new event.List            (owner_, store_)
        , new event.Connect         (store_)        
    ]
    store.forEach((step)=> tc.AddStep(step))
    return tc
}

const Disconnect = function()
{
    let tc     = new TestCase('Disconnect Store Socket Clients')
    let steps_ = []

    let args = Array.prototype.slice.call(arguments)
    args.forEach((store)=> { steps_.push(new event.Disconnect (store)) })
    
    steps_.forEach((step)=> {tc.AddStep(step) })
    return tc
}

module.exports = 
{
      Std        : Std
    , Disconnect : Disconnect
}