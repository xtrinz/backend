const router 	               = require("express").Router()
    , { code, text, status } = require("../common/error")
    , { task }               = require("../common/models")
    , { Store }              = require("../objects/store")

// Create shop
router.post("/register", async (req, res, next) =>
{
  try
  {
    console.log('register-shop',req.body)
    let text_, data_ = {}, store
    switch(req.body.Task)
    {
        case task.New:
            store = new Store(req.body)
            await store.New(req.body)
            const mob_no = store.Data.MobileNo
            text_ = text.OTPSendToMobNo.format(mob_no.slice(-4))
            break;

        case task.ReadOTP:
            store  = new Store()
            await store.ConfirmMobNo(req.body)
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

// View store
router.get("/view", async (req, res, next) => {
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

// List stores
router.get("/list", async (req, res, next) =>
{
    try 
    {
      let store = new Store()
      req.query.UserID = req.body.User._id
      const data  = await store.ListStores(req.query)
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

// Add Staff
router.post("/staff", async (req, res, next) =>
{
    try 
    {
      let text_
      let store = new Store()
      switch(req.body.Task)
      {
        case task.Request:
          await store.AddStaff(req.body)
          text_ = text.WaitingForStaffReply
          break
        case task.Accept:
        case task.Deny:
          console.log(req.body.Task)
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

// List staff
router.get("/staff", async (req, res, next) =>
{
    try 
    {
      let store  = new Store()
      req.query.UserID = req.body.User._id
      console.log(req.query)
      const data = await store.ListStaff(req.query)
      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

module.exports = router