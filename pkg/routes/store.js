const router 	               = require('express').Router()
    , { code, text, status } = require('../common/error')
    , { task }               = require('../common/models')
    , { Store }              = require('../driver/store')

router.post('/register', async (req, res, next) =>
{
  try
  {
    console.log('register-shop',req.body)
    let text_, data_ = {}, store

    switch(req.body.Task)
    {
        case task.New:
            store = new Store(req.body)
            let id = await store.New(req.body)
            text_ = text.OTPSendToMobileNo.format(
                    store.Data.MobileNo.slice(-4))
            data_ = { StoreID : id }
            break

        case task.ReadOTP:
            store = new Store()
            await store.ConfirmMobileNo(req.body)
            text_ = text.OTPConfirmed
            break
        
        case task.Approve:
            store  = new Store()
            await store.Approve(req.body)
            text_ = text.Approved
            break
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
      let  store = new Store()
      const id   = req.query.StoreID
          , user = req.body.User._id
          , data = await store.Read(id, user)

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
      let store  = new Store()
      const data = await store.ListStores(req.body.User)
      
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

router.post('/staff', async (req, res, next) =>
{
    try 
    {
      let text_, store = new Store()

      switch(req.body.Task)
      {
        case task.Request:
          await store.AddStaff(req.body)
          text_ = text.WaitingForStaffReply
          break

        case task.Accept:
        case task.Deny:
          await store.SetStaffReplay(req.body)
          text_ = text.ResponseUpdated
          break

        case task.Revoke:
          await store.RevokeStaffReq(req.body)
          text_ = text.Revoked
          break

        case task.Relieve:
          await store.RelieveStaff(req.body)
          text_ = text.Relieved
          break
      }

      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : text_,
        Data    : {}
      })
    } catch (err) { next(err) }
})

router.get('/staff', async (req, res, next) =>
{
    try 
    {
      let store         = new Store()
      req.query.UserID  = req.body.User._id
      const data        = await store.ListStaff(req.query)

      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

module.exports = router