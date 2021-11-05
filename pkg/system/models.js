const Org          = process.env.ORG
class Error_
{
  constructor(code, status, reaon) 
  {
    this.Code   = code
    this.Status = status
    this.Reason = reaon
  }
}

const status   =
    {
        Success 				: 'Success'
      , Failed 			        : 'Failed'
      , Pending               	: 'Pending'
    }
    , Err_     = (code, reason) => { throw new Error_(code, status.Failed, reason) }

module.exports =
{
	Err_                          : Err_,
	Err                           : Error_,
	status                        : status,
	reason:
	{
			PurchaseNotFound 		: 'Purchase not found'
		, MapQueryFailed 			: 'Google map query failed'
		, UserNotFound 			    : 'User not found'
		, UserFound 			    : 'User exists'
		, IncorrectCredentials      : 'Incorrect username or password'
		, MobileNoNotConfirmed      : 'Mobile number not confirmed'
		, IncompleteRegistration    : 'Registration has not completed'
		, PasswdResetNotPermited    : 'Password reset not permited'
		, ProfileUpdated            : 'Profile updated'      
		, TokenMissing              : 'Token missing'
		, DBAdditionFailed 	        : 'Database addition failed' 
		, DBInsertionFailed         : 'Database insertion failed' 
		, DBRemovalFailed           : 'Database removal failed'
		, DBDeletionFailed          : 'Database deletion failed'
		, DBUpdationFailed          : 'Database updation failed'
		, NoHandlerFound            : 'No handler found'
		, OtpRejected               : 'OTP rejected' 
		, Internal 			        : 'Internal'   
		, StoreExists               : 'Store exists, use another name or number'
		, ProductExists             : 'Product Exists'
		, MutiStoreNotSupported     : 'Multistore purchase not supported'
		, BadState                  : 'Bad machine state'
		, ProductNotFound           : 'Product not found'
		, ProductUnavailable 		: 'Product unavailable'
		, StoreNotFound             : 'Store not found'
		, StoreClosed 				: 'Store Closed'
		, GracePeriodExceeded 		: 'Store checkout grace period exceeded'
		, AdminNotFound             : 'Admin not found'
		, StaffNotFound             : 'Staff not found'
		, UnapprovedStore           : 'Unapproved Store'
		, StaffExists               : 'Staff already exists'
		, CartNotFound              : 'Cart not found'
		, NoProductsFound           : 'No products found'
		, PageNotFound              : 'Page not found'
		, BadSignature              : 'Bad signature'
		, JournalNotFound           : 'Journal not found'
		, TransitNotFound           : 'Transit not found'
		, CancellationDenied        : 'On transit, cancellation denied'
		, UnknownTask 						  : 'Unknown task'
		, Unknown                   : 'Unknown'
		, Unauthorized              : 'Unauthorized'
		, NoContextFound            : 'No context found'
		, AddressNotFound           : 'Address not found'
		, AddressLimitExceeded      : 'Address limit exceeded'
		, NoAddressFound            : 'No address found'
		, NoSocketFound             : 'No socket found'
		, AgentNotFound             : 'Agent not found'
		, RegIncomplete             : 'Registration in progress'
		, APIError                  : 'API Error'
		, CartFlagged               : 'Cart has unavailable items'
		, TokenCreationFailed       : 'Payment token creation failed'
		, StatusRetrievalFailed     : 'Payment status retrieval failed'
		, RefundFailed              : 'Refund initiation failed'
		, RefundStatusRetrievalFailed: 'Refund status retrieval failed'
		, InvalidMid                : 'Invalid MID'
		, InvalidChecksum           : 'Invalid Checksum'
		, InvalidToken              : 'Invalid Token'
		, ResourceNotFound          : 'Resource Not Found'
		, PermissionDenied          : 'Permission Denied'
		, IncorrectInput 			: 'Incorrect Input'
		, NoteNotFound				: 'Note not found'
		, HasItemsWithNoCOD			: 'Purchase has items with no cash on delivery availabe'
	},
	text:
	{
		OTPSendToMobileNo           : 'OTP has been send to number ending with {0}'
		, OTPSend                   : 'OTP Send'
		, OTPSendVia                : 'OTP send via {0}'
		, OTPConfirmed              : 'OTP confirmed'
		, Registered                : 'Registered'
		, Approved                  : 'Approved'
		, LoggedIn                  : 'Logged in'
		, PasswdUpdated             : 'Password updated'
		, ProfileUpdated            : 'Profile updated'
		, ProductAdded              : 'Product added'
		, ProductUpdated            : 'Product updated'
		, ProductRemoved            : 'Product removed'
		, NoDataFound               : 'No data found'
		, AddressAdded              : 'Address added'
		, AddressUpdated            : 'Address updated'
		, AddressRemoved            : 'Address removed'
		, WaitingForStaffReply      : 'Waiting for staff reply'
		, ResponseUpdated           : 'Response updated'
		, Revoked                   : 'Revoked'
		, NoContextFound            : 'No context found'
		, Relieved                  : 'Relieved'
		, TestNotEnabled            : 'Test disabled'
		, PaymentInitiated          : 'Payment initiated'
		, PayoutGWSet               : 'Payment Gateway Configured'
		, NoteSet					: 'Note set'
		, Deleted					: 'Deleted'
	},
	code:
	{
		OK                        : 200
		, ACCEPTED                  : 202
		, BAD_REQUEST               : 400
		, UNAUTHORIZED              : 401
		, FORBIDDEN                 : 403
		, NOT_FOUND                 : 404
		, CONFLICT                  : 409
		, INTERNAL_SERVER           : 500
	},
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
		, ProductCount 			: 32			// Max count for cart elements
		, SocketCount 			: 3
		, CheckoutGracePeriod 	: 18
	},
	note:
	{
		  Terms 				: 'Terms and Conditions'  
		, Policy 				: 'Policy Policy' 
		, Help					: 'Help' 
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
		, TxnPending			: 'PENDING'
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
		, Paytm					: 'Paytm'
		, System 				: 'System'
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
		  , COD 				: 'Cash On Delivery'
	},
	command:
	{
		  Register 				: 'Register'
		, LoggedIn 				: 'LoggedIn'
	},
	refund:
	{
		    Legit 				: 'Legit Refund'
		  , Stale 				: 'Stale Refund'
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
		, ToBeApproved 			: 'ToBeApproved'
		, ToBeCorrected 		: 'ToBeCorrected'

		, StripeSucess 			: "payment_intent.succeeded"
		, StripeFailed 			: "payment_intent.payment_failed"

		, Success 				: 'Success'
		, Failed 			    : 'Failed'
        , Initiated             : 'Initiated'
		, TokenGenerated 		: 'TokenGenerated'
		, ToBeCollected 		: 'ToBeCollected'

		, OnDuty 				: 'OnDuty'
		, OffDuty 				: 'OffDuty'

		, None 					: 'None'						// None
		, CargoInitiated 		: 'CargoInitiated'				// Payment had succeeded
		, CargoCancelled 		: 'CargoCancelled'				// Order canceled by user 									#Exit By User

		, OrderRejected 		: 'OrderRejected' 				// Order rejected by the shop 								#Exit By Store
		, OrderTimeExceeded 	: 'OrderTimeExceeded'			// Order acceptance time limit for shop has been exceeded	#Exit By User
		, OrderAccepted 		: 'OrderAccepted'				// Order accpeted by shop
		, OrderProcessed		: 'OrderProcessed'				// Order processed by shop
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
	delay:	// In Minutes
	{
		  StoreRespLimit		: 5								// Order acceptace delay for shops
		, AgentRespLimit 		: 3 							// Transit acceptace delay for agents
		, AgentFilterLimit 		: 8 							// Time upper limit to find an agent for delivery
		, AdminRespLimit 		: 5
	},
	event:
	{
		  InitiationByUser		: 'InitiationByUser'			// event cargo initiated by user
		, CancellationByUser	: 'CancellationByUser'			// event cargo cancellation by user
		, RejectionByStore		: 'RejectionByStore'			// event order rejection by shop
		, TimeoutByStore		: 'RespTimeoutByStore'			// event order acceptance timeout
		, TimeoutByAdmin		: 'TimeoutByAdmin'
		, TimeoutBySystem		: 'TimeoutBySystem'
		, AcceptanceByStore		: 'AcceptanceByStore'			// event order acception by shop
		, ProcessByStore		: 'ProcessByStore'
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
		, Processed 			: 'Processed'					// to agent/user   on readiness from shop
		, AutoCancelled 		: 'Auto_Cancelled'				// to user/shop    on outstanding delay
		, NewTransit 			: 'New_Transit'					// to agents 	   on acceptance from shop
		, AgentReady 			: 'Agent_Ready'					// to shop/user    on acceptance from agent 
		, EnRoute 				: 'En_Route'					// to agent/user   on despachement from shop
		, Delivered 			: 'Delivered'					// to user/shop    on delivery
		, Ignored 				: 'Ignored'						// to none		   
		, NoAgents 				: 'No_Agents'					// to admin 	   on absents of live agents
		, StoreTimeout			: 'Timeout_By_Store'
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
		v1 						: 'v1'
	},
	resource:
	{
		  root					: '/'
		, test					: 'test'
		, user					: 'user'
		, agent					: 'agent'		
		, paytm					: 'paytm'
		, store					: 'store'
		, product				: 'product'
		, cart					: 'cart'
		, address				: 'address'
		, checkout				: 'checkout'
		, journal				: 'journal'
		, transit				: 'transit'
		, socket 				: 'socket'
		, cloudinary 			: 'cloudinary'	
		, note 					: 'note'		
	},
	verb:
	{
		  root					: '/'
		, add					: 'add'
		, view					: 'view'
		, list					: 'list'
		, modify				: 'modify'
		, set 					: 'set'
		, remove				: 'remove'
		, insert				: 'insert'
		, search				: 'search'
		, payment				: 'payment'
		, refund				: 'refund'
		, register				: 'register'
		, edit					: 'edit'
		, login					: 'login'
		, passwd				: 'passwd'
		, profile				: 'profile'
		, user					: 'user'
		, store					: 'store'
		, agent					: 'agent'
		, admin					: 'admin'
		, connect 				: 'connect'
		, disconnect 			: 'disconnect'	
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
		, Processed 			: 'Processed'
		, Deny 					: 'Deny'
		, Revoke 				: 'Revoke'
		, Relieve 				: 'Relieve'
		, Reject 				: 'Reject'
		, Accept 				: 'Accept'
		, Assign 				: 'Assign'
		, Terminate 			: 'Terminate'
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
		, void 					: 'NULL'
	},
	set:
	{
		  user					: 'user'
		, agent					: 'agent'			  
		, socket				: 'socket'
		, store					: 'store'
		, product				: 'product'
		, cart					: 'cart'
		, journal				: 'journal'
		, transit				: 'transit'
		, channel				: 'channel'
		, tags 					: 'tags'
		, note 					: 'note'
	},
	segment:
	{
		    db 					: 'db'
		  , route 				: 'route'
	}
}