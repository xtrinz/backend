const { ObjectId } 				      = require("mongodb")
    , router                          = require("express").Router()
    , { Transit }                     = require("../objects/transit")
    , { Engine }                      = require("../engine/engine")
    , { Store }                       = require("../objects/store")
    , { alerts, events, query }       = require("../common/models")
    , { Err_, code, status, reason }  = require("../common/error")

router.post("/user/cancel", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , query_ =
          {
              User : { _id: ObjectId(req.body.User._id) },
              _id  : ObjectId(req.body.JournalID)
          }
          , trans_ = await trans.Get(query_, query.Custom)
        if (!trans_) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        trans.Event = events.EventCancellationByUser
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Cancelled,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post("/store", async (req, res, next) =>
{
    try
    {
        let query_, event_, text_
          , store = new Store()
        await store.Authz(req.body.StoreID, req.body.User._id)
        
        switch(req.body.Task)
        {
          case task.Reject:
            query_ =
            {
                Store : { _id: ObjectId(req.body.StoreID) },
                _id   : ObjectId(req.body.JournalID)
            }
            event_ = events.EventRejectionByStore
            text_  = alerts.Rejected
            break

          case task.Accept:
            query_ =
            {
                Store : { _id: ObjectId(req.body.StoreID) },
                _id   : ObjectId(req.body.JournalID)
            }
            event_ = events.EventAcceptanceByStore
            text_  = alerts.Accepted          
            break

          case task.Despatch:
            query_ =
            {
                Store : { _id: ObjectId(req.body.StoreID) },
                _id   : ObjectId(req.body.JournalID)
            }
            event_ = events.EventDespatchmentByStore
            text_  = alerts.EnRoute
            break
        }

        let trans  = new Transit()
        let trans_ = await trans.Get(query_, query.Custom)
        if (!trans_) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        trans.Data.Event = event_
        let engine       = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post("/agent", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = await trans.AuthzAgent(req.body.TransitID, 
                                            req.body.User._id)
        if (!trans_) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        let event_, text_
        switch(req.body.Task)
        {
          case task.Reject:
            event_ = events.EventRejectionByAgent
            text_  = alerts.Rejected
            break

          case task.Ignore:
            event_ = events.EventIgnoranceByAgent
            text_  = alerts.Ignored
            break

          case task.Accept:
            event_ = events.EventAcceptanceByAgent
            text_  = alerts.Accepted          
            break

          case task.Complete:
            event_ = events.EventCompletionByAgent
            text_  = alerts.Delivered
            break            
        }

        trans.Event = event_
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

module.exports = router