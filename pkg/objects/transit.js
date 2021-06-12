const { ObjectID, ObjectId } 			= require("mongodb")
    , { transits, users, stores } 		= require("../common/database")
    , { Err_, code, reason }            = require("../common/error")
    , { states, events, entity, query } = require("../common/models")
    , { Engine }                        = require("../engine/engine")
    , test                              = require('../common/test')

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
      , Return 	        : ""                            // Machine's prev-state for fallbacks
      , State 		    : states.None                   // Machine init state
      , IsLive          : true                          // Is it ongoing transit
      , Event 		    : events.EventInitiationByUser  // Machine init event
      , MaxWT           : 35                            // Maximum Waiting Time (35min)
      , OrderedAt 	    : ''                            // Millis / https://currentmillis.com/
      , ETD   		    : 0                             // Estimated Time of Delivery
    }

    this.Get = async function(param, qType)
    {
        console.log('find-transit', { Param: param, QType: qType})
        let query_
        switch (qType)
        {
            case query.ByID   : query_ = { _id: ObjectId(param) } ; break;
            case query.Custom : query_ = param                    ; break;
        }
        let transit = await transits.findOne(query_)
        if (!transit)
        {
          console.log('transit-not-found', query_)
          return
        }
        this.Data = transit
        console.log('transit-found', { Transits: transit })
        return transit
    }

    // Time spend(in min) since order placement
    this.Delay      = function()                            
    {
        const   now    = Date.now()
              , millis = now - this.Data.OrderedAt
              , delay  = Math.floor(millis / (1000*60))
        console.log('time elapsed in min', {Delay : delay})
        return delay
    }

    this.Save       = async function()
    {
        console.log('save-transit', { Data: this.Data })
        const key  = { _id    : this.Data._id }
            , act  = { $set   : this.Data     }
            , opt  = { upsert : true          }
            , resp = await transits.updateOne(key, act, opt)
        if (!resp.result.ok)
        {
            console.log('transit-save-failed', { Data: this.Data, Result: resp.result})
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('transit-saved', { Data: this.Data })
    }
 
    this.Init       = async function()
    {
        // Get Src & Dest Contexts & Update SockIDs
        const query_user = { _id: ObjectId(this.Data.User._id), IsLive: true }
        let       user   = await users.findOne(query_user)
        if(!user) console.log('user-not-found', query_user)
        if (user)  this.Data.User.SockID = user.SockID

        const query_store = 
        { 
            $or : 
            [
                { 'StoreList.Owned'    : { $elemMatch: { $eq: String(this.Data.Store._id) } }, IsLive: true }
            , { 'StoreList.Accepted' : { $elemMatch: { $eq: String(this.Data.Store._id) } }, IsLive: true }
            ] 
        }
        , proj   = { SockID: 1 }
        let users_ = await users.find(query_store).project(proj).toArray()
        if (!users_.length) { console.log('no-users-found', query_store['$or']) }
    
        let sckts = []
        users_.forEach((u) => { sckts.push(...u.SockID)})
        this.Data.Store.SockID  = sckts
        this.Data._id           = new ObjectID()
        this.Data.OrderedAt     = Date.now()
        await this.Save()

        let engine = new Engine()
        await engine.Transition(this)
        console.log('transit-initialised', { Data: this.Data })
    }

    this.AuthzAgent       = async function(transit_id, user_id)
    {
        const tranist_ = await this.Get(transit_id, query.ByID)
        if (!tranist_) Err_(code.BAD_REQUEST, reason.TransitNotFound)

        if (this.Data.Agent._id !== '')
        {
            if(String(this.Data.Agent._id) === String(user_id))
            {
                console.log('agent-authorized', this.Data.Agent)
                return
            }            
        }
        for(let i =0; i < this.Data.Agents.length; i++)
        {
            if(String(this.Data.Agents[i]._id) === String(user_id))
            {
                console.log('agent-authorized', this.Data.Agents[i])
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