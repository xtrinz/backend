const express 	  = require("express")
const router 	  = express.Router()
const { code } 	  = require("../common/error")
const { Journal } = require("../database/journal")

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

module.exports = router