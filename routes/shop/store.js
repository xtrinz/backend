const express 	        = require("express")
const router 	          = express.Router()
const { code, text } 	  = require("../../common/error")
const { Store }         = require("../../database/store")
const { ObjectId }      = require("mongodb")
const { task }          = require("../../database/models")

// Create shop
router.post("/shop/register", async (req, res, next) =>
{
  try
  {
    console.log('register-shop',req.body)
    let text_, data_
    switch(req.body.Task)
    {
        case task.New:
            const store = new Store(req.body)
            await store.New(req.body)
            text_ = text.OTPSendToMobNo.format(store.MobileNo.slice(-4))
            break

        case task.ReadOTP:
            const store  = new Store()
            await store.ConfirmContactNo(req.body)
            text_ = text.OTPConfirmed
            break
        
        case task.Approve:
            const store  = new Store()
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

// List store
router.get("/store/list", async (req, res, next) => {
    try 
    {
      const   store = new Store()
            , id    = ObjectId(req.query.user._id)
            , data  = await store.MultiGetByUserID(id)

      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

// View store
router.get("/store/view", async (req, res, next) => {
    try 
    {
      const   store = new Store()
            , id    = ObjectId(req.query.StoreID)
            , user  = ObjectId(req.query.user._id)
            , data  = await store.Read(id, user)

      return res.status(code.OK).json({
        Status  : status.Success,
        Text    : '',
        Data    : data
      })
    } catch (err) { next(err) }
})

// TODO Delete & Edit APIs
// List orders...

module.exports = router