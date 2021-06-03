const { code, text, status } = require("../common/error")
    , router 	               = require("express").Router()
    , { Journal }            = require("../objects/journal")

// Stripe confirmation webhook
router.post("/confirm", async (req, res, next) =>
{
  try
  {
    const journal = new Journal()
    await journal.UpdateStatusAndInitTransit(req)
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : {}
    })
  } catch (err) 
  {
    console.log('confirmation-failed', { Err: err } )
    return res.status(code.BAD_REQUEST).json({
      Status  : status.Failed,
      Text    : '',
      Data    : {}
    })
  }
})

router.post("/create", async (req, res, next) =>
{
  try
  {
    const journal = new Journal() 
        , data    = await journal.New(req.body)

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.PaymentInitiated,
      Data    : data
    })
  } catch (err) { next(err) }
})

// List Journals (user/shop)
router.get("/list", async (req, res, next) =>
{
  try
  {
    const journal = new Journal() 
        , data    = await journal.List(req.query) // TODO
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
router.get("/read", async (req, res, next) =>
{
  try
  {
    const journal = new Journal() 
        , data    = await journal.Read(req.query) // TODO

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