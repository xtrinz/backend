const router                          = require("express").Router()
    , { Transit }                     = require("../objects/transit")
    , { Engine }                      = require("../engine/engine")
    , { alerts, events }              = require("../common/models")
    , { Err_, code, status, reason }  = require("../common/error")

/* Cargo cancellation by user */
router.post("/user/cancel", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndUserID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventCancellationByUser
        let engine = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Cancelled,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Order rejection by store */
router.post("/store/reject", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventRejectionByStore
        let engine = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Rejected,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Order acceptance by store */
router.post("/store/accept", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventAcceptanceByStore
        let engine = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Accepted,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Order despatchment by store */
router.post("/store/despatch", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventDespatchmentByStore
        let engine = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.EnRoute,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Transit ignorance by agent */
router.post("/agent/ignore", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
           ,trans_ = trans.GetByIDAndAgentInList()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventIgnoranceByAgent
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Ignored,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Transit acceptance by agent */
router.post("/agent/accept", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndAgentInList()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventAcceptanceByStore
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Accepted,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Transit rejection by agent */
router.post("/agent/reject", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndAgentID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventRejectionByStore
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Rejected,
            Data    : {}
        })
    } catch (err) { next(err) }
})

/* Transit completion by agent */
router.post("/agent/complete", async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , trans_ = trans.GetByIDAndAgentID()
        if (!trans_)
        Err_(code.BAD_REQUEST,
            reason.TransitNotFound)

        trans.Event = events.EventCompletionByAgent
        let engine  = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Delivered,
            Data    : {}
        })
    } catch (err) { next(err) }
})

module.exports = router