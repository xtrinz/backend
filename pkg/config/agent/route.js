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
        await agent.Create()
        text_ = text.OTPSendToMobileNo.format(
                    req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        const resp    = await Agent.Confirm(req.body)
        text_         = text.OTPConfirmed
        info_         = resp.Agent
        info_.Command = resp.Command
        data_         = { Command : info_.Command }
        res.setHeader('authorization', resp.Token)
        break

      case task.Register:
        info_         = req.body.Agent
        await Agent.Register(req.body)
        info_.Command = command.LoggedIn
        data_         = { Command : info_.Command }        
        text_         = text.Registered
        break

      case task.Approve:
        await Agent.Approve(req.body)
        text_ = text.Approved
        break
    }
  
    if(info_ && (info_.State === states.Registered  ||
                info_.State === states.ToBeApproved ))
    {
      data_         = await Agent.View(info_)
      data_.Command = info_.Command
    }

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_ })

  } catch(err) { next(err) }
})

// Read Profile
router.get('/view', async (req, res, next) => {
  try
  {
    const data = await Agent.View(req.body.Agent)

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
      const data = await Agent.List(req.query)
      
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.put('/edit', async (req, res, next) =>
{
  try 
  {
    await Agent.Edit(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router