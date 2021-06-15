const { code, text, status } = require("../common/error")
    , { states }             = require("../common/models")
    , router 	               = require("express").Router()
    , { Journal }            = require("../objects/journal")
    , { Transit }            = require("../objects/transit")

// Stripe confirmation webhook
router.post("/confirm", async (req, res, next) =>
{
  try
  {
    let   transit
    let   journal = new Journal()
    const status_ = await journal.UpdateStatus(req)
    if (status_ === states.StripeSucess)
    {
      transit = new Transit(journal.Data)
      await transit.Init()
    }
    journal.Data.Transit.ID = transit.Data._id
    await journal.Save()

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