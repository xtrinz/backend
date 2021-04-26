const express                   = require("express");
const { paymentStatus }         = require("../../database/stripe/webhook");
const router                    = express.Router();
const purchase		              = require("../customer/orderhistory")
const { ObjectId }  	          = require("mongodb")
const {machine, NewTransit}     = require("../../machine/machine")
const { code, status, reason }  = require("../../common/error");

router.post("/", async (req, res, next) => {
  try
  {
    let { data, eventType } = req.body;
    const { rawBody } = req;
    let signature = req.headers["stripe-signature"];
    await paymentStatus(rawBody, data, eventType, signature);
    await InitTransit(ObjectId(userid), ObjectId(purchaseid))
    res.sendStatus(200);
  } catch(err) 
  {
    // TODO 
    // [set api proper]
    // [see what happens when stripe recieved error return]
    console.log('unknown-error', err)
    res.sendStatus(400)
  }
})

async function InitTransit(user_id, purchase_id)
{
  try
  {
    console.log('init-transit', user_id, purchase_id)
    let data = await purchase.GetPurchaseByID(purchase_id)
    if (!data)
    {
      console.log(`Purchase-not-found. _id: ${purchase_id}`)
      let   code_   = code.BAD_REQUEST
          , status_ = status.Failed
          , reason_ = reason.PurchaseNotFound
      
      // throw new (code_, status_, reason_)
    }
    let user_lng      = 'x',
        user_lat      = 'y',
        user_sock_ids = ["asdfa", "asdfa"],
        shop_sock_ids = ["asdfa", "asdfa"],
        shop_id       = ObjectId(data.products.shopinfoid),
        shop_lng      = data.address.latlng.lng,
        shop_lat      = data.address.latlng.lat;
    let context       = NewTransit(user_id, user_lng, user_lat, user_sock_ids,
                                   shop_id, shop_lng, shop_lat, shop_sock_ids)
    await machine.Transition(context)
    console.log('transit-init-passed', context)
  } catch (err)
  {
      console.log('set-error-hadling-properly', err) // TODO
      // TODO init Refund()
      throw new Api500Error("Internal Error", "Trasit placement failed");
  }
}

module.exports = router
