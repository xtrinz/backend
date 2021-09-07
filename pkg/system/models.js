const Org          = process.env.ORG
module.exports =
{
	qtype:
	{
		  NearList				: 'ListNearer'
		, Pending				: 'ApprovalPendning'
		, NearPending			: 'NearerPendingList'
	},
	dbset:
	{
		  Limit					: 16
	},
	limits:
	{
		  AddressCount 			: 16			// Max allowed address count / user
		, ProductCount 			:128			// Max count for cart elements
		, SocketCount 			: 3
	},
	paytm: 
	{
		  WEBSTAGING			: 'WEBSTAGING'
		, DEFAULT				: 'DEFAULT'

		, Success 				: 'S'
		, Order 				: 'ORDER_{0}'
		, Refund 				: 'REFUND_{0}'

		, TxnSuccess 			: 'TXN_SUCCESS'
		, TxnFailure			: 'TXN_FAILURE'
		, RefundPending 		: 'PENDING'
		, RefundFailure 		: 'TXN_FAILURE'

		, Type 					:
		{
			REFUND				: 'REFUND'
		}
		, ReadTimeout 			: 80000
	},
	tags:
	{
		  HOME 					: 'HOME'
		, OFFICE 				: 'OFFICE'
	},
	query:
	{
		  ByID					: 'ByID'
		, ByMail 				: 'ByMail'
		, ByMobileNo 			: 'ByMobileNo'
		, Custom 				: 'Custom'
		, ByUserID				: 'ByUserID'
	},
	mode:
	{
		  User 					: 'User'
		, Agent 				: 'Agent'
		, Admin 				: 'Admin'
		, Store 				: 'Store'
		, Enabled 				: 'HasModeEnabled'
	},
	source:
	{
		  User 					: 'User'
		, Agent 				: 'Agent'
		, Admin 				: 'Admin'
		, Store					: 'Store'
	},
	type:
	{
		  FORWARD 				: 'FORWARD'
		, RETURN 				: 'RETURN'
	},
	channel:
	{
		    Stripe 				: 'Stripe'
		  , Paytm 				: 'Paytm'
	},
	states:
	{
		  Running 				: 'Running'
		, Closed 				: 'Closed'
		, State 				: 'State'

		, None 					: 'None'
        , New 					: 'New'
        , MobConfirmed          : 'MobileNumberConfirmed'
		, EntityCreated 		: 'EntityCreated'	
        , Registered            : 'Registered'

		, StripeSucess 			: "payment_intent.succeeded"
		, StripeFailed 			: "payment_intent.payment_failed"

		, Success 				: 'Success'
		, Failed 			    : 'Failed'
        , Initiated             : 'Initiated'
		, TokenGenerated 		: 'TokenGenerated'


		, None 					: 'None'						// None
		, CargoInitiated 		: 'CargoInitiated'				// Payment had succeeded
		, CargoCancelled 		: 'CargoCancelled'				// Order canceled by user 									#Exit By User

		, OrderRejected 		: 'OrderRejected' 				// Order rejected by the shop 								#Exit By Store
		, OrderTimeExceeded 	: 'OrderTimeExceeded'			// Order acceptance time limit for shop has been exceeded	#Exit By User
		, OrderAccepted 		: 'OrderAccepted'				// Order accpeted by shop
		, OrderOnHold 			: 'OrderOnHold'					// Order on hold due to no nearby live agents
		, OrderIgnored 			: 'OrderIgnored'
		, OrderDespatched 		: 'OrderDespatched'				// Order gave to agent by shop

		, TransitIgnored 		: 'TransitIgnored'				// Agent manually ingored the transit
		, TransitTimeout 		: 'TransitTimeout'				// Agent transit acceptance deadline exceeded
		, TransitOnHold 		: 'TransitOnHold'
		, TransitAccepted 		: 'TransitAccepted'				// Agent accepted the transit
		, TransitAbandoned		: 'TransitAbandoned'
		, TransitRejected 		: 'TransitRejected'				// Agent droped/rejected the transit after acceptance
		, TransitEnroute 		: 'TransitEnroute'				// The package is on the way.[state in hold, not decided]
		, TransitOnDrift 		: 'TransitOnDrift'				// Agent needs help on the way of delivery
		, TransitTerminated 	: 'TransitTerminated'			// 															#Exit By Store
		, TranistCompleted 		: 'TranistCompleted'			// The package delivered									#End
	},
	delay:
	{
		  StoreRespLimit		: 4								// Order acceptace delay for shops
		, AgentRespLimit 		: 3 							// Transit acceptace delay for agents
		, AgentFilterLimit 		: 8 							// Time upper limit to find an agent for delivery
	},
	event:
	{
		  InitiationByUser		: 'InitiationByUser'			// event cargo initiated by user
		, CancellationByUser	: 'CancellationByUser'			// event cargo cancellation by user
		, RejectionByStore		: 'RejectionByStore'			// event order rejection by shop
		, TimeoutByStore		: 'RespTimeoutByStore'			// event order acceptance timeout
		, AcceptanceByStore		: 'AcceptanceByStore'			// event order acception by shop
		, DespatchmentByStore	: 'DespatchmentByStore'			// event order despatchment by shop
		, IgnoranceByAgent		: 'IgnoranceByAgent'			// event transit ignorance by agent
		, LockByAdmin			: 'LockByAdmin'					// event tranist under ctrl of admin
		, AssignmentByAdmin		: 'AssignmentByAdmin'
		, TerminationByAdmin	: 'TerminationByAdmin'
		, ScheduleByAdmin 		: 'ScheduleByAdmin'		
		, TimeoutByAgent		: 'RespTimeoutByAgent'			// event transit acceptance timeout
		, RefeedByAdmin			: 'RefeedAgentsByAdmin'			// event re-initiate search for agents 
		, AcceptanceByAgent		: 'AcceptanceByAgent'			// event transit acception by agent
		, RejectionByAgent		: 'RejectionByAgent'			// event transit rejection by agent
		, CompletionByAgent		: 'CompletionByAgent'			// event tranist completion by agent
		, ResendOTP 			: 'ResendOTP'
	},
	alerts:
	{
		  NewOrder 				: 'New_Order'					// to shop 		   on init
		, Rejected 				: 'Rejected'					// to user 		   on rejection by shop
		, Cancelled 			: 'Cancelled'					// to shop 		   on cancel by user
		, Accepted 				: 'Accepted'					// to user 		   on acceptance from shop
		, AutoCancelled 		: 'Auto_Cancelled'				// to user/shop    on outstanding delay
		, NewTransit 			: 'New_Transit'					// to agents 	   on acceptance from shop
		, AgentReady 			: 'Agent_Ready'					// to shop/user    on acceptance from agent 
		, EnRoute 				: 'En_Route'					// to agent/user   on despachement from shop
		, Delivered 			: 'Delivered'					// to user/shop    on delivery
		, Ignored 				: 'Ignored'						// to none		   
		, NoAgents 				: 'No_Agents'					// to admin 	   on absents of live agents
		, Locked 				: 'Admin_Locked'				// to other admins on an admin choose a ticket
		, Assigned 				: 'Agent_Assigned'
		, Terminated			: 'Order_Terminated'
		, Scheduled 			: 'Scheduled'
		, OTPSend 				: 'OTP_Send'
	},
	entity:
	{
		  User 					: 'User'						// the user
		, Store 				: 'Store'						// the store
		, Agent 				: 'Agent'						// the agent
		, Admin 				: 'Admin'						// the admin
	},
	message:
	{
		  OnAuth    			: `Your ${Org} authentication code is X-{0}`
		, ForPkg    			: `Your package collection code is X-{0}`
		, EmailSub  			: `OTP confirmation alert from ${Org}`
		, EmailBody 			: `Your One Time Password(OTP) is : X-{0}`
		, ResetPass 			: `Your OTP to reset password is : X-{0}`
	},
	gw :
	{
		  SMS 					: 'SMS'
		, MAIL					: 'MAIL'
	},
	version:
	{
		v1 						: '' // TODO updates as 'v1'
	},
	resource:
	{
		  root					: '/'
		, test					: '/test'
		, user					: '/user'
		, paytm					: '/paytm'
		, store					: '/store'
		, product				: '/product'
		, cart					: '/cart'
		, address				: '/address'
		, checkout				: '/checkout'
		, journal				: '/journal'
		, transit				: '/transit'
	},
	verb:
	{
		  root					: '/'
		, add					: '/add'
		, view					: '/view'
		, list					: '/list'
		, modify				: '/modify'
		, remove				: '/remove'
		, insert				: '/insert'
		, search				: '/search'
		, payment				: '/payment'
		, refund				: '/refund'
		, register				: '/register'
		, edit					: '/edit'
		, login					: '/login'
		, passwd				: '/passwd'
		, profile				: '/profile'
		, user					: '/user'
		, store					: '/store'
		, agent					: '/agent'
		, admin					: '/admin'		
	},
	task:
	{
		  New					: 'New'
		, ReadOTP 				: 'Read_OTP'
		, Register 				: 'Register'
		, GenOTP 				: 'Generate_OTP'
		, ConfirmOTP 			: 'Confirm_OTP'
		, SetPayoutGW			: 'Set_Payout_GW'
		, SetPassword			: 'Set_Password'
		, EditPasswd 			: 'Edit_Password'
		, EditProfile 			: 'Edit_Profile'
		, Approve 				: 'Approve'
		, Request				: 'Request'
		, Cancel 				: 'Cancel'
		, Accept 				: 'Accept'
		, Deny 					: 'Deny'
		, Revoke 				: 'Revoke'
		, Relieve 				: 'Relieve'
		, Reject 				: 'Reject'
		, Accept 				: 'Accept'
		, Assign 				: 'Assign'
		, Termiate 				: 'Terminate'
		, Despatch 				: 'Despatch'
		, Ignore 				: 'Ignore'
		, Complete 				: 'Complete'
		, ResendOTP				: 'Resend_OTP'

		, Enabled				: 'HasTaskEnabled' // Ref field for RBAC		
	},
	method:
	{
		  get 					: 'GET'
		, post 					: 'POST'
		, put 					: 'PUT'
		, delete 				: 'DELETE'
	}
}