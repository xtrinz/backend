const { code, status, states
    ,   text, task, command } = require('../../system/models')
    , router                  = require('express').Router()
    , { Agent }               = require('../agent/driver')

router.post('/register', async (req, res, next) => 
{
  try
  {
    let text_ = '', data_ = {}, agent, info_
    switch (req.body.Task)
    {
      case task.New:
        agent = new Agent(req.body)
        await agent.New()
        text_ = text.OTPSendToMobileNo.format(
                    req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        agent = new Agent()
        const resp = await agent.ConfirmMobileNo(req.body)
        text_         = text.OTPConfirmed
        info_         = agent.Data
        info_.Command = resp.Command
        data_         = { Command : info_.Command }
        res.setHeader('authorization', resp.Token)
        break

      case task.Register:
        agent         = new Agent()
        info_         = req.body.Agent
        await agent.Register(req.body)
        info_.Command = command.LoggedIn
        data_         = { Command : info_.Command }        
        text_         = text.Registered
        break

      case task.Approve:
        store  = new Agent()
        await store.Approve(req.body)
        text_ = text.Approved
        break
    }
  
    if(info_ && (info_.State === states.Registered  ||
                info_.State === states.ToBeApproved ))
    data_ = 
    {
        Name      : info_.Name
      , MobileNo  : info_.MobileNo
      , Email     : info_.Email
      , Mode      : info_.Mode
      , Command   : info_.Command
//      , Status    : req.body.Agent.Status      
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_ })

  } catch(err) { next(err) }
})

// Read Profile
router.get('/view', async (req, res, next) => {
  try {

    let now_ = new Date()
    if(!now_.is_today(req.body.Agent.Status.SetOn))
    { req.body.Agent.Status = states.OffDuty      }
    else
    {
      req.body.Agent.Status = req.body.Agent.Status.Current
      /* No action: set state as set by seller */
    }
    const data = 
    {
        Name      : req.body.Agent.Name
      , MobileNo  : req.body.Agent.MobileNo
      , Email     : req.body.Agent.Email
      , Mode      : req.body.Agent.Mode
      , Status    : req.body.Agent.Status
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

router.get('/list', async (req, res, next) =>
{
    try 
    {
      const agent = new Agent()
          , data  = await agent.List(req.query)
      
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.put('/profile', async (req, res, next) =>
{
  try 
  {
    const agent  = new Agent()
    await agent.Edit(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router