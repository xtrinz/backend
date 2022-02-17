
const { ObjectId } = require('mongodb')
    , router       = require('express').Router()
    , engine       = require('../core/engine')
    , Model        = require('../../../sys/models')
    , Log          = require('../../../sys/log')
    , db           = require('../transit/archive')

router.post('/client', async (req, res, next) =>
{
    try
    {
        let query_ =
          {
              'Client.ID' : ObjectId(req.body.Client._id),
                    _id   : ObjectId(req.body.TransitID)
          }
          , text_ , event_
          , trans_ = await db.Get(query_, Model.query.Custom)
        if (!trans_)
        {
          Log('transit-not-found', { Query: query_, Request: req.body })
          Model.Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)
        }

        switch(req.body.Task)
        {
          case Model.task.Cancel:
            event_ = Model.event.Cancel
            text_  = Model.alerts.Cancelled
            break
        }

        trans_.Event = event_
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/seller', async (req, res, next) =>
{
    try
    {
        const query_ = 
        {
              _id         : ObjectId(req.body.TransitID)
            , 'Seller.ID' : ObjectId(req.body.Seller._id) 
        }
        let trans_   = await db.Get(query_, Model.query.Custom)
        if (!trans_) 
        {
          Log('transit-not-found', { Query: query_, Request: req.body })
          Model.Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)
        }
        let event_, text_
        switch(req.body.Task)
        {
          case Model.task.Reject:
            event_ = Model.event.Reject
            text_  = Model.alerts.Rejected
            break

          case Model.task.Accept:
            event_ = Model.event.Accept
            text_  = Model.alerts.Accepted          
            break

          case Model.task.Processed:
            event_ = Model.event.Ready
            text_  = Model.alerts.Processed          
            break            

          case Model.task.Despatch:
            trans_.Seller.Otp = req.body.OTP
            event_ = Model.event.Despatch
            text_  = Model.alerts.EnRoute
            break
        }

        trans_.Event = event_
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
        const query_ = 
        {
                    _id  : ObjectId(req.body.TransitID)
            , 'Agent.ID' : ObjectId(req.body.Agent._id) 
        }
        let trans_   = await db.Get(query_, Model.query.Custom)
        if (!trans_) 
        {
          Log('transit-not-found', { Query: query_, Request: req.body })
          Model.Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)
        }

        let event_, text_
        switch(req.body.Task)
        {
          case Model.task.ResendOTP:
            event_ = Model.event.ResendOTP
            text_  = Model.alerts.OTPSend
            break

          case Model.task.Reject:
            event_ = Model.event.Reject
            text_  = Model.alerts.Rejected
            break

          case Model.task.Ignore:
            trans_.Agent._id = req.body.Agent._id
            event_ = Model.event.Ignore
            text_  = Model.alerts.Ignored
            break

          case Model.task.Accept:
            trans_.Agent =
            {
                ID       : req.body.Agent._id
              , Name     : req.body.Agent.Name
              , MobileNo : req.body.Agent.MobileNo
            }
            event_ = Model.event.Commit
            text_  = Model.alerts.Accepted          
            break

          case Model.task.Complete:
            trans_.Agent.Otp = req.body.OTP
            event_ = Model.event.Done
            text_  = Model.alerts.Delivered
            break            
        }
        trans_.Event = event_
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

router.post('/arbiter', async (req, res, next) =>
{
    try
    {
        
        const query_ = { _id   : ObjectId(req.body.TransitID) }
            , trans_ = await db.Get(query_, Model.query.Custom)
        if (!trans_) 
        {
          Log('transit-not-found', { Query: query_, Request: req.body })
          Model.Err_(Model.code.BAD_REQUEST,  Model.reason.TransitNotFound)
        }

        let event_, text_
        switch(req.body.Task)
        { 
          case Model.task.Assign:
            trans_.Agent =
            {
                MobileNo : req.body.MobileNo
            }
            event_ = Model.event.Assign
            text_  = Model.alerts.Assigned
            break

          case Model.task.Terminate:
            event_ = Model.event.Terminate
            text_  = Model.alerts.Terminated
            break          
        }
        trans_.Event = event_
        await engine.Transition(trans_)

        return res.status(Model.code.OK).json({
            Status  : Model.status.Success,
            Text    : text_,
            Data    : {}
        })
    } catch (err) { next(err) }
})

module.exports = router
