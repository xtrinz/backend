const router 	               = require('express').Router()
    , { code, text, status, states, command
    , task, mode }           = require('../../system/models')
    , { Store }              = require('../store/driver')

router.post('/register', async (req, res, next) =>
{
  try
  {
    console.log('register-shop',req.body)
    let text_ = '', data_ = {}, store, info_

    switch (req.body.Task)
    {
      case task.New:
        store = new Store(req.body)
        await store.New()
        text_ = text.OTPSendToMobileNo.format(
                    req.body.MobileNo.slice(-4))
        break

      case task.ReadOTP:
        store = new Store()
        const resp = await store.ConfirmMobileNo(req.body)
        text_         = text.OTPConfirmed
        info_         = store.Data
        info_.Command = resp.Command
        data_         = { Command : info_.Command }
        res.setHeader('authorization', resp.Token)
        break

      case task.Register:
        store         = new Store()
        info_         = req.body.Store
        await store.Register(req.body)
        info_.Command = command.LoggedIn
        data_         = { Command : info_.Command }        
        text_         = text.Registered
        break

      case task.Approve:
        store  = new Store()
        await store.Approve(req.body)
        text_ = text.Approved
        break
      }

    if(info_ && (info_.State === states.Registered   ||
                 info_.State === states.ToBeApproved ))
    {
      const store = new Store()
      let in_ =
      {
          ID    : info_._id
        , Mode  : mode.Store
        , Store : info_
      }
      data_ = await store.Read(in_)
      data_.Command = info_.Command
    }
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text_,
      Data    : data_
    })
  } catch (err) { next(err) }
})

router.get('/view', async (req, res, next) => {
    try 
    {
      const store = new Store()
      let in_
      switch(req.body.Mode)
      {
        case mode.Store:
          in_ =
          {
              ID    : req.body.Store._id
            , Mode  : req.body.Mode
            , Store : req.body.Store
          }
          break
        default:
          in_ =
          {
              ID    : req.query.StoreID
            , Mode  : req.body.Mode
            , Store : {}
          }          
          break
      }
      const data  = await store.Read(in_)

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
      const store = new Store()
          , data  = await store.List(req.query, req.body.Mode)
      
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
    let  store = new Store()
    await store.Edit(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProfileUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router