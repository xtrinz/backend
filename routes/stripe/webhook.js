const express                         = require("express");
const { paymentStatus }               = require("../../database/stripe/webhook");
const router                          = express.Router();
const db_purchase		                  = require("../../database/customer/orderhistory")
const db_user		                      = require("../../database/customer/profile")
const db_shop		                      = require("../../database/shop/crudshop")
const { ObjectId }  	                = require("mongodb")
const {machine, NewTransit}           = require("../../machine/machine")
const { Err, code, status, reason }   = require("../../common/error");

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

    let purchase = await db_purchase.GetByID(purchase_id)
    if (!purchase)
    {
      console.log(`Purchase-not-found. _id: ${purchase_id}`)
      throw new Err(code.BAD_REQUEST,
                    status.Failed,
                    reason.PurchaseNotFound)
    }

    let user = await db_user.GetByID(user_id)
    if (!user)
    {
      console.log(`User-not-found. _id: ${user_id}`)
      throw new Err(code.BAD_REQUEST,
                    status.Failed,
                    reason.UserNotFound)
    }

    let shop = await db_shop.GetByID(ObjectId(purchase.products.shopinfoid))
    if (!shop)
    {
      console.log(`Shop-not-found. _id: ${ObjectId(purchase.products.shopinfoid)}`)
      throw new Err(code.BAD_REQUEST,
                    status.Failed,
                    reason.ShopNotFound)
    }

    let user_lng      = purchase.address.coordinates[0],
        user_lat      = purchase.address.coordinates[1],
        user_sock_ids = user.sockids,
        shop_sock_ids = shop.sockids,
        shop_id       = shop._id,
        shop_lng      = shop.location.coordinates[0],
        shop_lat      = shop.location.coordinates[1];

    let context       = NewTransit(user_id, user_lng, user_lat, user_sock_ids,
                                   shop_id, shop_lng, shop_lat, shop_sock_ids)
    await machine.Transition(context)
    console.log('transit-init-passed', context)
  } catch (err)
  {
      console.log('transit-init-failed', err)
      // TODO init Refund(user_id, purchase_id)
      if (err instanceof Err) { throw err }
      throw new Err(code.INTERNAL_SERVER,
                    status.Failed,
                    reason.Internal)
  }
}
module.exports = router