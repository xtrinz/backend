
const { ObjectId } = require('mongodb')
    , router       = require('express').Router()
    , { Transit }  = require('../transit/driver')
    , { Engine }   = require('../../engine/engine')
    , { Err_  }    = require('../../system/models')
    , Model        = require('../../system/models')
    , db           = require('../transit/archive')

router.post('/user', async (req, res, next) =>
{
    try
    {
        let query_ =
          {
              'User._id' : ObjectId(req.body.User._id),
              _id  : ObjectId(req.body.TransitID)
          }
          , text_ , event_
          , trans_ = await db.Get(query_, Model.query.Custom)
        if (!trans_) Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)

        switch(req.body.Task)
        {
          case Model.task.Cancel:
            event_ = Model.event.CancellationByUser
            text_  = Model.alerts.Cancelled
            break
        }

        trans_.Event = event_
        let engine   = new Engine()
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/store', async (req, res, next) =>
{
    try
    {
        const query_ = { _id   : ObjectId(req.body.TransitID) }
        let trans_   = await db.Get(query_, Model.query.Custom)
        if (!trans_) Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)

        let event_, text_
        switch(req.body.Task)
        {
          case Model.task.Reject:
            event_ = Model.event.RejectionByStore
            text_  = Model.alerts.Rejected
            break

          case Model.task.Accept:
            event_ = Model.event.AcceptanceByStore
            text_  = Model.alerts.Accepted          
            break

          case Model.task.Processed:
            event_ = Model.event.ProcessByStore
            text_  = Model.alerts.Processed          
            break            

          case Model.task.Despatch:
            trans_.Store.Otp = req.body.OTP
            event_ = Model.event.DespatchmentByStore
            text_  = Model.alerts.EnRoute
            break
        }

        trans_.Event = event_
        let engine   = new Engine()
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/agent', async (req, res, next) =>
{
    try
    {
        let trans_  = await Transit.AuthzAgent(req.body.TransitID, req.body.Agent._id)

        let event_, text_
        switch(req.body.Task)
        {
          case Model.task.ResendOTP:
            event_ = Model.event.ResendOTP
            text_  = Model.alerts.OTPSend
            break

          case Model.task.Reject:
            event_ = Model.event.RejectionByAgent
            text_  = Model.alerts.Rejected
            break

          case Model.task.Ignore:
            trans_.Agent._id = req.body.User._id
            event_ = Model.event.IgnoranceByAgent
            text_  = Model.alerts.Ignored
            break

          case Model.task.Accept:
            trans_.Agent =
            {
                _id      : req.body.Agent._id
              , SockID   : req.body.Agent.SockID
              , Name     : req.body.Agent.Name
              , MobileNo : req.body.Agent.MobileNo
            }
            event_ = Model.event.AcceptanceByAgent
            text_  = Model.alerts.Accepted          
            break

          case Model.task.Complete:
            trans_.Agent.Otp = req.body.OTP
            event_ = Model.event.CompletionByAgent
            text_  = Model.alerts.Delivered
            break            
        }
        trans_.Event = event_
        let engine       = new Engine()
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/admin', async (req, res, next) =>
{
    try
    {
        
        const query_ = { _id   : ObjectId(req.body.TransitID) }
            , trans_ = await db.Get(query_, Model.query.Custom)
        if (!trans_) Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)
        
        let event_, text_
        switch(req.body.Task)
        {
          case Model.task.Accept:
            trans_.Admin =
            {
                _id      : req.body.User._id
              , SockID   : req.body.User.SockID
              , Name     : req.body.User.Name
              , MobileNo : req.body.User.MobileNo
            }
            event_ = Model.event.LockByAdmin
            text_  = Model.alerts.Locked          
            break 
          
          case Model.task.Assign:
            trans_.Agent =
            {
                MobileNo : req.body.MobileNo
            }
            event_ = Model.event.AssignmentByAdmin
            text_  = Model.alerts.Assigned
            break

          case Model.task.Terminate:
            event_ = Model.event.TerminationByAdmin
            text_  = Model.alerts.Terminated
            break          
        }
        trans_.Event = event_
        let engine       = new Engine()
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

module.exports = router