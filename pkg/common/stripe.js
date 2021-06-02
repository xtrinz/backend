const sec_key                       = process.env.STRIPE_SECRET_KEY
    , wh_sec                        = process.env.STRIPE_WEBHOOK_SECRET
    , pub_key                       = process.env.STRIPE_PUBLISHABLE_KEY
    , stripe                        = require("stripe")(sec_key)
    , { Err, code, status, reason } = require("../common/error")

function Stripe(data)
{
    this.Amount     = data.Amount
    this.MetaData   = 
    {
        JournalID : String(data.JournalID)
    }
    this.Currency   = 'inr'

    this.CreateIntent = async function()
    {
        const intent = await stripe.paymentIntents.create({
            amount    : this.Amount * 100 // Need to be in pise as per stripe
          , currency  : this.Currency
          , metadata  : this.MetaData     // TODO Hash the data
        })

        const resp =
        {
            IntentID       : intent.id
          , ClientSecret   : intent.client_secret
          , PublishableKey : pub_key
        }
        return resp
    }

    this.MatchEventSign = async function(req, sign)
    {
      try
      {
        console.log('match-stripe-event-sign', req, sign)
        return stripe.webhooks.constructEvent(req, sign, wh_sec)
      } catch(err)
      {
        console.log('bad-signature', err)
        const   code_       = code.BAD_REQUEST
              , status_     = status.Failed
              , reason_     = reason.BadSignature
        throw new Err(code_, status_, reason_)
      }
    }
}

module.exports =
{
  Stripe: Stripe
}