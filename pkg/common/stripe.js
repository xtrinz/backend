const sec_key                = process.env.STRIPE_SECRET_KEY
    , wh_sec                 = process.env.STRIPE_WEBHOOK_SECRET
    , pub_key                = process.env.STRIPE_PUBLISHABLE_KEY
    , stripe                 = require('stripe')(sec_key)
    , { Err_, code, reason } = require('../common/error')

function Stripe(data)
{
    if(data)
    {
      this.Amount     = data.Amount
      this.MetaData   = 
      {
          JournalID : String(data.JournalID)
      }
      this.Currency   = 'inr'
    }

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

    this.MatchEventSign = async function(raw_body, sign)
    {
      try
      {
        console.log('match-stripe-event-sign', { RawBody: raw_body, Sign: sign} )
        let event_ = stripe.webhooks.constructEvent(raw_body, sign, wh_sec)
        return event_
      } catch(err)
      {
        console.log('bad-signature', err)
        Err_(code.BAD_REQUEST, reason.BadSignature)
      }
    }
}

module.exports =
{
  Stripe: Stripe
}