const router                          = require("express").Router()
    , { Transit }                     = require("../database/transit")
    , { machine }                     = require("../machine/machine")
    , { alerts, events }              = require("../machine/models")
    , { Err, code, status, reason }   = require("../common/error")

/* Cargo cancellation by user */
router.post("/user/cancel", async (req, res, next) =>
{
    try
    {
        let trans = new Transit()
        const trans_ = trans.GetByIDAndUserID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventCancellationByUser
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventRejectionByStore
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventAcceptanceByStore
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndStoreID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventDespatchmentByStore
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndAgentInList()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventIgnoranceByAgent
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndAgentInList()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventAcceptanceByStore
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndAgentID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventRejectionByStore
        await machine.Transition(trans)

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
        let trans = new Transit()
        const trans_ = trans.GetByIDAndAgentID()
        if (!trans_)
        {
            const code_       = code.BAD_REQUEST
                , status_     = status.Failed
                , reason_     = reason.TransitNotFound
            throw new Err(code_, status_, reason_)
        }

        trans.Event = events.EventCompletionByAgent
        await machine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Delivered,
            Data    : {}
        })
    } catch (err) { next(err) }
})

module.exports = router