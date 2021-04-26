const {states, events}	= require("./models")
const method			= require("./methods")
const Machine 			=
{
	Handler :
	{
		[states.None] 					:
		{
			  [events.EventInitiationByUser] 		: method.CargoInitiatedByUser
		}
		, [states.CargoInitiated] 		:
		{ 
			  [events.EventCancellationByUser] 		: method.CargoCancelledByUser
			, [events.EventRejectionByShop] 		: method.OrderRejectedByShop // #02
			, [events.EventAcceptanceTimeout]		: method.OrderAcceptanceTimeout
			, [events.EventAcceptanceByShop]		: method.OrderAcceptedByShop
		}
		, [states.CargoCancelled] 		:
		{

		}

		, [states.OrderRejected] 		:
		{ 

		}
		, [states.OrderTimeExceeded] 	:
		{ 
			
		}

		, [states.OrderAccepted] 		:
		{ 
			  [events.EventIgnoranceByAgent] 		: method.TransitIgnoredByAgent
			, [events.EventRespTimeoutByAgent] 		: method.TransitAcceptanceTimeout
			, [events.EventRejectionByShop] 		: method.OrderRejectedByShop// handler separately #02
			, [events.EventAcceptanceByAgent] 		: method.TransitAcceptedByAgent
		}

		, [states.TransitIgnored] 		:
		{

		}

		, [states.TransitTimeout] 		:
		{

		}

		, [states.TransitAccepted] 		:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent // handle separately?#01 
			, [events.EventRejectionByShop]  		: method.CargoCancelledByUser
			, [events.EventDespatchmentByShop] 		: method.OrderDespatchedByShop
		}

		, [states.OrderDespatched] 		:
		{
			  [events.EventRejectionByAgent] 		: method.TransitRejectedByAgent // #01 
			, [events.EventCompletionByAgent] 		: method.TranistCompleteByAgent
		}

		, [states.TransitRejected] 		:
		{

		}

		, [states.TranistComplete] 		:
		{

		}
	}

	, GetHandler: (states, event_) => { return this.Handler.event_ }

	, Transition: function (ctxt)
	{
		let Method = this.GetHandler(ctxt.State, ctxt.Event)
		if (Method === undefined)
		{
			return
		}
		Method(ctxt.Data)
	}
}

function NewTransit
		( user_id, user_lng, user_lat, user_sock_ids,
		  shop_id, shop_lng, shop_lat, shop_sock_ids)
{
	// Shop attributes
	this.Shop 		=
	{
		_id: shop_id,
		SockID: shop_sock_ids,
		Location:
        {
			Lng: shop_lng,
			Lat: shop_lat
		}
	}

	// User attributes
	this.User 		= 
	{
		_id: user_id,
		SockID: user_sock_ids,
		Location:
		{
			Lng: user_lng,
			Lat: user_lat
		}
	}

	// Machine init state
	this.State 		= states.None

	// Machine init event
	this.Event 		= events.EventInitiationByUser

	// Format: 	Millis
	// Ref: 	https://currentmillis.com/
	this.OrderedAt 	= Date.now()

	// Estimated Time of Delivery
	this.ETD   		= function()
	{
		let etd
		/*const start = Date.now()
		const millis = Date.now() - start
		const delay = Math.floor(millis / (1000*60))
		console.log(`min elapsed = ${delay}`);
		*/
		// Write algorithm to calcuate 
		// Estimated Time of Delivery(ETD)
		// using cordinates of user and shop
		return etd
	}();

	// this.Agent
	// this.Admin
	// this.Package
	this.Save = function()
	{
		// Save Record to DB
	}
	console.log(`new-transit. doc: ${this}`)
}

module.exports =
{
	machine		: Machine,
	NewTransit	: NewTransit
}