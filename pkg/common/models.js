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

		, Reject 					: 'Reject'
		, Accept 					: 'Accept'
		, Despatch 					: 'Despatch'
		, Ignore 					: 'Ignore'
		, Complete 					: 'Complete'
		
	},
	channel:
	{
		  Stripe 					: 'Stripe'
	},
	states:
	{
		  Running 					: 'Running'
		, Closed 					: 'Closed'

		, None 						: 'None'
        , New 						: 'New'
        , MobConfirmed              : 'MobileNumberConfirmed'
        , Registered                : 'Registered'

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
	event:
	{
		  InitiationByUser			: 'InitiationByUser'			// event cargo initiated by user
		, CancellationByUser		: 'CancellationByUser'			// event cargo cancellation by user
		, RejectionByStore			: 'RejectionByStore'			// event order rejection by shop
		, TimeoutByStore			: 'RespTimeoutByStore'			// event order acceptance timeout
		, AcceptanceByStore			: 'AcceptanceByStore'			// event order acception by shop
		, DespatchmentByStore		: 'DespatchmentByStore'			// event order despatchment by shop
		, IgnoranceByAgent			: 'IgnoranceByAgent'			// event transit ignorance by agent
		, TimeoutByAgent			: 'RespTimeoutByAgent'			// event transit acceptance timeout
		, RefeedByAdmin				: 'RefeedAgentsByAdmin'			// event re-initiate search for agents 
		, AcceptanceByAgent			: 'AcceptanceByAgent'			// event transit acception by agent
		, RejectionByAgent			: 'RejectionByAgent'			// event transit rejection by agent
		, CompletionByAgent			: 'CompletionByAgent'			// event tranist completion by agent
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