const { ObjectId } 				                  = require('mongodb')
    , router                                = require('express').Router()
    , { Transit }                           = require('../driver/transit')
    , { Engine }                            = require('../engine/engine')
    , { Store }                             = require('../driver/store')
    , { alerts, event, query, task, mode }  = require('../common/models')
    , { Err_, code, status, reason }        = require('../common/error')
    , db                                    = require('../archive/transit')

router.post('/user/cancel', async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
          , query_ =
          {
              'User._id' : ObjectId(req.body.User._id),
              _id  : ObjectId(req.body.TransitID)
          }
        trans.Data = await db.Get(query_, query.Custom)
        if (!trans.Data) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        trans.Data.Event = event.CancellationByUser
        let engine       = new Engine()
        await engine.Transition(trans)

        return res.status(code.OK).json({
            Status  : status.Success,
            Text    : alerts.Cancelled,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/store', async (req, res, next) =>
{
    try
    {
        const query_ = { _id   : ObjectId(req.body.TransitID) }
        let trans  = new Transit()
        trans.Data = await db.Get(query_, query.Custom)
        if (!trans.Data) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        let event_, text_, store = new Store()
        await store.Authz(trans.Data.Store._id, req.body.User._id)
        
        switch(req.body.Task)
        {
          case task.Reject:
            event_ = event.RejectionByStore
            text_  = alerts.Rejected
            break

          case task.Accept:
            event_ = event.AcceptanceByStore
            text_  = alerts.Accepted          
            break

          case task.Despatch:
            trans.Data.Store.Otp = req.body.OTP
            event_ = event.DespatchmentByStore
            text_  = alerts.EnRoute
            break
        }

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

router.post('/agent', async (req, res, next) =>
{
    try
    {
        let trans  = new Transit()
        await trans.AuthzAgent(req.body.TransitID, req.body.User._id)

        let event_, text_
        switch(req.body.Task)
        {
          case task.Reject:
            event_ = event.RejectionByAgent
            text_  = alerts.Rejected
            break

          case task.Ignore:
            trans.Data.Agent._id = req.body.User._id
            event_ = event.IgnoranceByAgent
            text_  = alerts.Ignored
            break

          case task.Accept:
            trans.Data.Agent =
            {
                _id      : req.body.User._id
              , SockID   : req.body.User.SockID
              , Name     : req.body.User.Name
              , MobileNo : req.body.User.MobileNo
            }
            event_ = event.AcceptanceByAgent
            text_  = alerts.Accepted          
            break

          case task.Complete:
            trans.Data.Agent.Otp = req.body.OTP
            event_ = event.CompletionByAgent
            text_  = alerts.Delivered
            break            
        }
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

router.post('/admin', async (req, res, next) =>
{
    try
    {
        if(req.body.User.Mode !== mode.Admin)
        Err_(code.BAD_REQUEST, reason.Unauthorized)
        
        const query_ = { _id   : ObjectId(req.body.TransitID) }
        let trans  = new Transit()
        trans.Data = await db.Get(query_, query.Custom)
        if (!trans.Data) Err_(code.BAD_REQUEST, reason.TransitNotFound)
        
        let event_, text_
        switch(req.body.Task)
        {
          case task.Accept:
            trans.Data.Admin =
            {
                _id      : req.body.User._id
              , SockID   : req.body.User.SockID
              , Name     : req.body.User.Name
              , MobileNo : req.body.User.MobileNo
            }
            event_ = event.LockByAdmin
            text_  = alerts.Locked          
            break 
          
          case task.Assign:
            trans.Data.Agent =
            {
                MobileNo : req.body.MobileNo
            }
            event_ = event.AssignmentByAdmin
            text_  = alerts.Assigned
            break

          case task.Termiate:
            event_ = event.TerminationByAdmin
            text_  = alerts.Terminated
            break          
        }
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

module.exports = router