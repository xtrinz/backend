const { ObjectId }           = require('mongodb')
    , { code, text, status } = require('../../system/error')
    , {Cart, CartEntry}      = require('../cart/driver')
    , { Store }              = require('../store/driver')
    , { Address }            = require('../address/driver')
    , router 	               = require('express').Router()
    , tally                  = require('../../system/tally')

// Insert product
router.post('/insert', async (req, res, next) => {
  try
  {
    const entry = new CartEntry(req.body)
    await entry.Insert(req.body.User.CartID)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductAdded,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// List products
router.get('/list', async (req, res, next) =>
{
  try
  {
    const address = new Address()
    const addr    = await address.Read({
        UserID    : req.body.User._id
      , AddressID : req.body.AddressID
    })

    const data    = await (new Cart()).Read(req.body.User._id)
     data.Address = addr

    const src_loc = await (new Store()).GetLoc(data.StoreID)
        , dest_loc= 
        {
            Lattitude : data.Address.Lattitude
          , Longitude : data.Address.Longitude
        }

    await tally.SetBill(data, src_loc, dest_loc)
    delete data.Address
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : '',
      Data    : data
    })
  } catch (err) { next(err) }
})

// Update product
router.post('/modify', async (req, res, next) => {
  try
  {
    const entry = new CartEntry()
    await entry.Update( ObjectId(req.body.User.CartID),
                        ObjectId(req.body.ProductID),
                        req.body.Quantity)
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// Remove product
router.delete('/remove', async (req, res, next) =>
{
  try
  {
    const entry = new CartEntry()
    await entry.Remove( ObjectId(req.body.User.CartID),
                        ObjectId(req.body.ProductID))
    
    return res.status(code.OK).json({
      Status  : status.Success,
      Text    : text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router
