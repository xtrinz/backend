const { Address }            = require("../database/address")
    , router 	               = require("express").Router()
    , { code, status, text } = require("../common/error")
    , { ObjectId }           = require("mongodb")

// View Addr Missing
// Set Default Addr Missing

// Add address
router.post("/add", async (req, res, next) => {
  try
  {
    const entry = new Address(req.body)
    await entry.Insert(ObjectId(req.body.UserID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressAdded,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// List addresss
router.get("/list", async (req, res, next) =>
{
  try
  {
    const address   = new Address() 
    const data      = await address.List(req.query.UserID) // TODO

    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Modify address
router.post("/modify", async (req, res, next) => {
  try
  {
    const entry = new Address()
    await entry.Update(req.body)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressUpdated,
      Data    : ''
    })
  } catch (err) { next(err) }
})

// Remove address
router.delete("/remove", async (req, res, next) =>
{
  try
  {
    const entry = new Address()
    await entry.Remove( ObjectId(req.body.UserID),
                        ObjectId(req.body.AddressID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.AddressRemoved,
      Data    : ''
    })
  } catch (err) { next(err) }
})

module.exports = router