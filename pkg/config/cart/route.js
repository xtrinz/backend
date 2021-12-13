const cart      = require('../cart/driver')
    , addr      = require('../address/driver')
    , { Entry } = require('./model')
    , router 	  = require('express').Router()
    , tally     = require('../../system/tally')
    , Model     = require('../../system/models')
    , db        = require('../exports')[Model.segment.db]

router.post('/insert', async (req, res, next) => {
  try
  {
    const entry = new Entry(req.body)
    await cart.Insert(req.body.User.CartID, entry)

    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductAdded,
      Data    : {}
    })
  } catch (err) { next(err) }
})

router.get('/list', async (req, res, next) =>
{
  try
  {
    let data, src_loc, dest_loc
    
    data = await cart.Read(req.body.User._id)
    dest_loc = src_loc  = { Latitude : 0, Longitude : 0 }

    if(req.query.AddressID)
    {
      const in_     =
      {
          UserID    : req.body.User._id
        , AddressID : req.query.AddressID
      }
      data.Address  = await addr.Read(in_)
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

router.post('/modify', async (req, res, next) => {
  try
  {

    let data_ =
    {
        CartID    : req.body.User.CartID
      , ProductID : req.body.ProductID 
      , IsInc     : req.body.IsInc      
    }
    await cart.Update(data_)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductUpdated,
      Data    : {}
    })
  } catch (err) { next(err) }
})

router.delete('/remove', async (req, res, next) =>
{
  try
  {

    await cart.Remove(req.body.User.CartID,
                      req.body.ProductID)
    
    return res.status(Model.code.OK).json({
      Status  : Model.status.Success,
      Text    : Model.text.ProductRemoved,
      Data    : {}
    })
  } catch (err) { next(err) }
})

module.exports = router
