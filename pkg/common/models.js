module.exports =
{
	tags:
	{
		  HOME 						: 'HOME'
		, OFFICE 					: 'OFFICE'
	},
	query:
	{
		  ByID						: 'ByID'
		, ByMail 					: 'ByMail'
		, ByMobNo 					: 'ByMobNo'
		, Custom 					: 'Custom'
		, ByUserID					: 'ByUserID'
	},
	mode:
	{
		  User 						: 'User'
		, Agent 					: 'Agent'
		, Admin 					: 'Admin'
	},
	type:
	{
		  FORWARD 					: 'FORWARD'
		, RETURN 					: 'RETURN'
	},
	task:
	{
		  New						: 'New'
		, ReadOTP 					: 'Read_OTP'
		, Register 					: 'Register'
		, GenOTP 					: 'Generate_OTP'
		, ConfirmOTP 				: 'Confirm_OTP'
		, SetPassword				: 'Set_Password'
		, EditPasswd 				: 'Edit_Password'
		, EditProfile 				: 'Edit_Profile'
		, Approve 					: 'Approve'
		, Request					: 'Request'
		, Accept 					: 'Accept'
		, Deny 						: 'Deny'
		, Relieve 					: 'Relieve'
	},
	channel:
	{
		Stripe 						: 'Stripe'
	},
	states:
	{
		None 						: 'None'
        , New 						: 'New'
        , MobConfirmed              : 'MobileNumberConfirmed'
        , Registered                : 'Registered'

		, PaymentSuccessTransitSuccess 	: 'Payment-Success-Transit-Success'
		, PaymentSuccessTransitFailed 	: 'Payment-Success-Transit-Failed'
		, PaymentFailedTransitSuccess 	: 'Payment-Failed-Transit-Success'
		, PaymentFailedTransitFailed 	: 'Payment-Failed-Transit-Failed'

		, StripeSucess 				: "payment_intent.succeeded"
		, StripeFailed 				: "payment_intent.payment_failed"

		, Success 					: 'Success'
		, Failed 			        : 'Failed'
        , Initiated                 : 'Initiated'

		, None 						: 'None'						// None
		, CargoInitiated 			: 'CargoInitiated'				// Payment had succeeded
		, CargoCancelled 			: 'CargoCancelled'				// Order canceled by user

		, OrderRejected 			: 'OrderRejected' 				// Order rejected by the shop
		, OrderTimeExceeded 		: 'OrderTimeExceeded'			// Order acceptance time limit for shop has been exceeded
		, OrderAccepted 			: 'OrderAccepted'				// Order accpeted by shop
		, OrderOnHold 				: 'OrderOnHold'					// Order on hold due to no nearby live agents
		, OrderDespatched 			: 'OrderDespatched'				// Order gave to agent by shop

		, TransitIgnored 			: 'TransitIgnored'				// Agent manually ingored the transit
		, TransitTimeout 			: 'TransitTimeout'				// Agent transit acceptance deadline exceeded
		, TransitAccepted 			: 'TransitAccepted'				// Agent accepted the transit
		, TransitRejected 			: 'TransitRejected'				// Agent droped/rejected the transit after acceptance
		, TransitEnroute 			: 'TransitEnroute'				// The package is on the way.[state in hold, not decided]
		, TranistCompleted 			: 'TranistCompleted'			// The package delivered
	},
	delay:
	{
		  StoreRespLimit			: 4								// Order acceptace delay for shops
		, AgentRespLimit 			: 3 							// Transit acceptace delay for agents
		, AgentFilterLimit 			: 8 							// Time upper limit to find an agent for delivery
	},
	events:
	{
		  EventInitiationByUser		: 'EventInitiationByUser'		// event cargo initiated by user
		, EventCancellationByUser	: 'EventCancellationByUser'		// event cargo cancellation by user
		, EventRejectionByStore		: 'EventRejectionByStore'		// event order rejection by shop
		, EventRespTimeoutByStore	: 'EventRespTimeoutByStore'		// event order acceptance timeout
		, EventAcceptanceByStore	: 'EventAcceptanceByStore'		// event order acception by shop
		, EventDespatchmentByStore	: 'EventDespatchmentByStore'	// event order despatchment by shop
		, EventIgnoranceByAgent		: 'EventIgnoranceByAgent'		// event transit ignorance by agent
		, EventRespTimeoutByAgent	: 'EventRespTimeoutByAgent'		// event transit acceptance timeout
		, EventAcceptanceByAgent	: 'EventAcceptanceByAgent'		// event transit acception by agent
		, EventRejectionByAgent		: 'EventRejectionByAgent'		// event transit rejection by agent
		, EventCompletionByAgent	: 'EventCompletionByAgent'		// event tranist completion by agent
	},
	alerts:
	{
		  NewOrder 					: 'New_Order'					// to shop 		 on init
		, Rejected 					: 'Rejected'					// to user 		 on rejection by shop
		, Cancelled 				: 'Cancelled'					// to shop 		 on cancel by user
		, Accepted 					: 'Accepted'					// to user 		 on acceptance from shop
		, AutoCancelled 			: 'Auto_Cancelled'				// to user/shop  on outstanding delay
		, NewTransit 				: 'New_Transit'					// to agents 	 on acceptance from shop
		, AgentReady 				: 'Agent_Ready'					// to shop/user  on acceptance from agent 
		, EnRoute 					: 'En_Route'					// to agent/user on despachement from shop
		, Delivered 				: 'Delivered'					// to user/shop  on delivery
		, Ignored 					: 'Ignored'						// to none
		, NoAgents 					: 'No_Agents'					// to admin 	 on absents of live agents
	},
	entity:
	{
		  User 						: 'User'						// the user
		, Store 					: 'Store'						// the store
		, Agent 					: 'Agent'						// the agent
		, Admin 					: 'Admin'						// the admin
	}
}