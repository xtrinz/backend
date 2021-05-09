const {states, events, entity}		= require("../machine/models")
const { ObjectID } 					= require("mongodb")
const { transits } 					= require("./connect")
const { Err, code, status, reason } = require("../common/error")
const { machine }                   = require("../machine/machine")

function Transit (journal)
{
    this._id 		= ''
    this.JournalID  = journal._id
    this.Store 		=
    {
          _id         : journal.Seller.ID
        , SockID      : []
        , Name        : journal.Seller.Name
        , ContactNo   : journal.Seller.ContactNo
        , Location    : journal.Seller.Location
        , Address     : journal.Seller.Address
    }

    this.User 		= 
    {
          _id         : journal.Buyer.ID
        , SockID      : []
        , Name        : journal.Buyer.Name
        , ContactNo   : journal.Buyer.ContactNo
        , Location    : journal.Buyer.Location
        , Address     : journal.Buyer.Address
    }

    this.Return 	= ""                                    // Machine's prev-state for fallbacks
    this.State 		= states.None                           // Machine init state
    this.Event 		= events.EventInitiationByUser          // Machine init event
    this.MaxWT      = 35                                    // Maximum Waiting Time (35min)
    this.OrderedAt 	= Date.now()                            // Millis / https://currentmillis.com/
    this.ETD   		= 0                                     // Estimated Time of Delivery

    this.Delay      = function()                            // Time spend(in min) since order placement
    {
        const   now    = Date.now()
              , millis = now - this.OrderedAt
              , delay  = Math.floor(millis / (1000*60))
        console.log(`time elapsed in min: ${delay}`)
        return delay
    }

    this.Abstract   = function(...args)
    {
        let obj =
        {
            TransitID   : this._id
          , JournalID	: this.JournalID
          , UserName 	: this.User.Name
          , StoreName 	: this.Store.Name
          , StoreCity   : this.Store.Address.City
        }
        if (this.Agent && !args.includes(entity.Agent))
        {
            obj.AgentName      = this.Agent.Name
            obj.AgentContactNo = this.Agent.ContactNo
        }
        if (this.Admin && !args.includes(entity.Admin))
        {
            obj.AdminName      = this.Admin.Name
        }
        return obj
    }

    this.Save       = async function()
    {
        console.log('save-transit', this)
        const   query = { _id : this._id }
              , act   = { $set : this }
              , opt   = { upsert : true }
        const resp  = await transits.updateOne(query, act, opt)
        if (resp.modifiedCount !== 1) 
        {
            console.log('save-transit-failed', this)
            const   code_   = code.INTERNAL_SERVER
                  , status_ = status.Failed
                  , reason_ = reason.DBAdditionFailed
            throw new Err(code_, status_, reason_)
        }
    }

    this.Init       = async function()
    {
        // Get Src & Dest Contexts & Update SockIDs
        this._id 		= new ObjectID()
        this.Save()
        await machine.Transition(this)
        console.log('transit-initialised', context)
    }
}

module.exports =
{
    Transit	: Transit
}