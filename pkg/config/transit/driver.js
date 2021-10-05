const {  ObjectId } 	        = require('mongodb')
    , { Err_, code, reason
    , states, event, query }    = require('../../system/models')
    , { Engine }                = require('../../engine/engine')
    , db                        =
    {
          transit               : require('../transit/archive')
        , user                  : require('../user/archive')
        , store                 : require('../store/archive')
    }

function Transit (journal)
{
    if(journal)
    this.Data   =
    {
        _id 		    : ''
      , JournalID       : ObjectId(journal._id)
      , Store 		    :
      {                  
        _id             : ObjectId(journal.Seller.ID)
        , SockID        : []
        , Name          : journal.Seller.Name
        , Longitude     : journal.Seller.Longitude
        , Latitude      : journal.Seller.Latitude
        , MobileNo      : journal.Seller.MobileNo
        , Address       : journal.Seller.Address
      }                  
      , User 		    : 
      {                  
        _id             : ObjectId(journal.Buyer.ID)
        , SockID        : []
        , Name          : journal.Buyer.Name
        , Longitude     : journal.Buyer.Longitude
        , Latitude      : journal.Buyer.Latitude          
        , MobileNo      : journal.Buyer.MobileNo
        , Address       : journal.Buyer.Address
      }                  
      , Agent           :
      {                 
          _id           : ''
        , SockID        : []
        , Name          : ''         
        , MobileNo      : ''
      }                 
      , Agents          : []                            // Pool of live agents filtered for transit
      , Admin           : {}
      , Admins          : []
      , History         : []
      , Return 	        : ''                            // Machine's prev-state for fallbacks
      , State 		    : states.None                   // Machine init state
      , IsLive          : true                          // Is it ongoing transit
      , Event 		    : event.InitiationByUser        // Machine init event
      , MaxWT           : 35                            // Maximum Waiting Time (35min)
      , OrderedAt 	    : ''                            // Millis / https://currentmillis.com/
      , ETD   		    : 0                             // Estimated Time of Delivery
    }

    this.Init       = async function(_id)
    {

        this.Data.User.SockID  = await db.user.GetUserSockID(this.Data.User._id)
        this.Data.Store.SockID = await db.store.GetStoreSockID(this.Data.Store._id)
        this.Data._id          = _id
        this.Data.OrderedAt    = (new Date()).toISOString()

        let engine = new Engine()
        await engine.Transition(this)
        console.log('transit-initialised', { Data: this.Data })
    }

    this.AuthzAgent       = async function(transit_id, user_id)
    {
        this.Data = await db.transit.Get(transit_id, query.ByID)
        if (!this.Data) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        if(this.Data.Agent && (String(this.Data.Agent._id) === String(user_id)))
        {
            console.log('agent-authorized', this.Data.Agent)
            return
        }
        for (let i = 0; i < this.Data.Agents.length; i++)
        {
            let agent = this.Data.Agents[i]
            if(String(agent._id) === String(user_id))
            {
                console.log('agent-authorized', {Agent : agent })
                return
            }
        }
        console.log('agent-not-listed', { AgentID: user_id, Agents: this.Data.Agents })
        Err_(code.UNAUTHORIZED, reason.Unauthorized)
    }
}

module.exports =
{
    Transit	: Transit
}
