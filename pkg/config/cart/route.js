const { ObjectId }       = require('mongodb')
    , {Cart, CartEntry}  = require('../cart/driver')
    , { Address }        = require('../address/driver')
    , router 	           = require('express').Router()
    , tally              = require('../../system/tally')
    , Model              = require('../../system/models')
    , db                 = require('../exports')[Model.segment.db]

// Insert product
router.post('/insert', async (req, res, next) => {
  try
  {
    const entry = new CartEntry(req.body)
    await entry.Insert(req.body.User.CartID)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductAdded,
      Data    : {}
    })
  } catch (err) { next(err) }
})

// List products
router.get('/list', async (req, res, next) =>
{
  try
  {
    let data, src_loc, dest_loc
    
    data = await (new Cart()).Read(req.body.User._id)
    dest_loc = src_loc  = { Latitude : 0, Longitude : 0 }

    if(req.query.AddressID)
    {
      const in_     =
      {
          UserID    : req.body.User._id
        , AddressID : req.query.AddressID
      }
      data.Address  = await Address.Read(in_)
      src_loc       = await db.store.Location(data.StoreID)
      dest_loc      =
      {
          Latitude  : data.Address.Latitude
        , Longitude : data.Address.Longitude
      }
    }
    const cords = 
    {
          Src  : src_loc
        , Dest : dest_loc
    }
    data.Bill = await tally.Bill(data, cords)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
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
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductUpdated,
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
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router
