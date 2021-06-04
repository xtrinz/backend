const { ObjectID } 				 = require("mongodb")
    , { transits } 				 = require("../common/database")
    , { Err_, code, reason }     = require("../common/error")
    , { states, events, entity } = require("../common/models")
    , { Engine }                 = require("../engine/engine")

function Transit (journal)
{
    if(journal)
    this.Data   =
    {
        _id 		    : ''
      , JournalID       : journal._id
      , Store 		    :
      {                  
            _id         : journal.Seller.ID
          , SockID      : []
          , Name        : journal.Seller.Name
          , Longitude   : journal.Seller.Longitude
          , Latitude    : journal.Seller.Latitude
          , MobileNo    : journal.Seller.MobileNo
          , Address     : journal.Seller.Address
      }                  
      , User 		    : 
      {                  
            _id         : journal.Buyer.ID
          , SockID      : []
          , Name        : journal.Buyer.Name
          , Longitude   : journal.Buyer.Longitude
          , Latitude    : journal.Buyer.Latitude          
          , MobileNo    : journal.Buyer.MobileNo
          , Address     : journal.Buyer.Address
      }                  
      , Agent           : {}
      , Agents          : []                            // Pool of live agents filtered for transit
      , Return 	        : ""                            // Machine's prev-state for fallbacks
      , State 		    : states.None                   // Machine init state
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
        let transit = await products.findOne(query_)
        if (!transit)
        {
          console.log('transit-not-found', query_)
          return
        }
        this.Data = transit
        console.log('transit-found', { Product: transit })
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

    this.Abstract   = function(...args)
    {
        let obj =
        {
            TransitID     : this.Data._id
          , JournalID	  : this.Data.JournalID
          , UserName 	  : this.Data.User.Name
          , StoreName 	  : this.Data.Store.Name
          , StoreCity     : this.Data.Store.Address.City
          , StoreLocation : [ this.Data.Store.Longitude, this.Data.Store.Latitude ]
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
        this.Data._id       = new ObjectID()
        this.Data.OrderedAt = Date.now()
        await this.Save()
        let engine = new Engine()
        await engine.Transition(this)
        console.log('transit-initialised', { Data: this.Data })
    }
}

module.exports =
{
    Transit	: Transit
}