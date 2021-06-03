const { ObjectID } 				 = require("mongodb")
    , { transits } 				 = require("../common/database")
    , { Err_, code, reason }     = require("../common/error")
    , { states, events, entity } = require("../common/models")
    , { engine }                 = require("../engine/engine")

function Transit (journal)
{
    if(journal)
    this.Date   =
    {
        _id 		      : ''
      , JournalID       : journal._id
      , Store 		  :
      {
            _id         : journal.Seller.ID
          , SockID      : []
          , Name        : journal.Seller.Name
          , ContactNo   : journal.Seller.ContactNo
          , Location    : journal.Seller.Location
          , Address     : journal.Seller.Address
      }

      , User 		    : 
      {
            _id         : journal.Buyer.ID
          , SockID      : []
          , Name        : journal.Buyer.Name
          , ContactNo   : journal.Buyer.ContactNo
          , Location    : journal.Buyer.Location
          , Address     : journal.Buyer.Address
      }

      , Agent           : {}
      , Agents          : []                                    // Pool of live agents filtered for transit
      , Return 	        : ""                                    // Machine's prev-state for fallbacks
      , State 		    : states.None                           // Machine init state
      , Event 		    : events.EventInitiationByUser          // Machine init event
      , MaxWT           : 35                                    // Maximum Waiting Time (35min)
      , OrderedAt 	    : Date.now()                            // Millis / https://currentmillis.com/
      , ETD   		    : 0                                     // Estimated Time of Delivery
    }

    // Time spend(in min) since order placement
    this.Delay      = function()                            
    {
        const   now    = Date.now()
              , millis = now - this.Data.OrderedAt
              , delay  = Math.floor(millis / (1000*60))
        console.log(`time elapsed in min: ${delay}`)
        return delay
    }

    this.Abstract   = function(...args)
    {
        let obj =
        {
            TransitID     : this.Data._id
          , JournalID	  : this.Data.JournalID
          , UserName 	  : this.Data.User.Name
          , StoreName 	  : this.Data.Store.Name
          , StoreCity     : this.Data.Store.Address.City
          , StoreLocation : this.Data.Store.Location
        }
        if (this.Agent && !args.includes(entity.Agent))
        {
            obj.AgentName      = this.Data.Agent.Name
            obj.AgentContactNo = this.Data.Agent.ContactNo
        }
        if (this.Admin && !args.includes(entity.Admin))
        {
            obj.AdminName      = this.Data.Admin.Name
        }
        return obj
    }

    this.Save       = async function()
    {
        console.log('save-transit', this.Data)
        const key  = { _id    : this.Data._id }
            , act  = { $set   : this.Data     }
            , opt  = { upsert : true          }
            , resp = await transits.updateOne(key, act, opt)
        if (!resp.result.ok)
        {
            console.log('transit-save-failed', { Data: this.Data, Result: resp.result})
            Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
        }
        console.log('transit-saved', this.Data)
    }
 
    this.Init       = async function()
    {
        // Get Src & Dest Contexts & Update SockIDs
        this.Data._id = new ObjectID()
        await this.Save()
        await engine.Transition(this.Data)
        console.log('transit-initialised', this.Data)
    }
}

module.exports =
{
    Transit	: Transit
}