const { code } 	  = require("../common/error")
    , router 	    = require("express").Router()
    , { Journal } = require("../database/journal")

// Stripe confirmation webhook
router.post("/journal/confirm", async (req, res, next) =>
{
  try
  {

    const journal = new Journal()
    await journal.UpdateStatusAndInitTransit(req)
    return res.send(code.OK)

  } catch (err) 
  { 
    console.log('payment-confirmation-failed', err)
    return res.send(code.BAD_REQUEST)
  }
})

// List Journals (user/shop)
router.get("/journal/list", async (req, res, next) =>
{
  try
  {
    const journal = new Journal() 
    const data = await journal.List(req.query) // TODO
    /*
    {
      type: 'user/shop'
      id  : 'user_id/shop_id'
      opt : 'success/processing...'
    }*/    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Journals (user/shop)
router.get("/journal/read", async (req, res, next) =>
{
  try
  {
    const journal = new Journal() 
    const data = await journal.Read(req.query) // TODO
    /*
    {
      type: 'user/shop'
      id  : 'user_id/shop_id'
      opt : 'success/processing...'
    }*/
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

module.exports = router