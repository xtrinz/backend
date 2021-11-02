
const { Err_ }      = require('../../system/models')
    , { Engine }    = require('../../engine/engine')
    , Model         = require('../../system/models')
    , db            = require('../exports')[Model.segment.db]

class Transit
{
    constructor(journal)
    {
      this._id 		    = ''
      this.JournalID    = journal._id
      this.Store 		=
      {                  
          _id           : journal.Seller.ID
        , SockID        : []
        , Name          : journal.Seller.Name
        , MobileNo      : journal.Seller.MobileNo
        , Address       : journal.Seller.Address
      } 
      this.User 		= 
      {                  
          _id           : journal.Buyer.ID
        , SockID        : []
        , Name          : journal.Buyer.Name
        , MobileNo      : journal.Buyer.MobileNo
        , Address       : journal.Buyer.Address
      }                  
      this.Agent        =
      {                 
          _id           : ''
        , SockID        : []
        , Name          : ''         
        , MobileNo      : ''
      }                 
      this.Agents       = []                            // Pool of live agents filtered for transit
      this.Admin        = {}
      this.Admins       = []
      this.History      = []
      this.Return 	    = ''                            // Machine's prev-state for fallbacks
      this.State 		= Model.states.None             // Machine init state
      this.IsLive       = true                          // Is it ongoing transit
      this.Event 		= Model.event.InitiationByUser  // Machine init Model.event
      this.MaxWT        = 35                            // Maximum Waiting Time (35min)
      this.OrderedAt 	= ''                            // Millis / https://currentmillis.com/
      this.ETD   		= 0                             // Estimated Time of Delivery
    }

    async Init(_id)
    {

        this.User.SockID  = await db.user.GetUserSockID(this.User._id)
        this.Store.SockID = await db.store.GetStoreSockID(this.Store._id)
        this._id          = _id
        this.OrderedAt    = (new Date()).toISOString()

        let engine = new Engine()
        await engine.Transition(this)
        console.log('transit-initialised', { Data: this })
    }

    static async AuthzAgent (transit_id, user_id)
    {
        let transit_ = await db.transit.Get(transit_id, Model.query.ByID)
        if (!transit_) Err_(Model.code.BAD_REQUEST, Model.reason.TransitNotFound)

        if(transit_.Agent && (String(transit_.Agent._id) === String(user_id)))
        {
            console.log('agent-authorized', transit_.Agent)
            return transit_
        }
        for (let i = 0; i < transit_.Agents.length; i++)
        {
            let agent = transit_.Agents[i]
            if(String(agent._id) === String(user_id))
            {
                console.log('agent-authorized', {Agent : agent })
                return transit_
            }
        }
        console.log('agent-not-listed', { AgentID: user_id, Agents: transit_.Agents })
        Err_(Model.code.UNAUTHORIZED, Model.reason.Unauthorized)
    }
}

module.exports =
{
    Transit	: Transit
}
