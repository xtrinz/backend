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
	desc 						  :
	{
		    Paid 			  	  : 'User Paid'
		  , Accepted 		  	  : 'Order Accepted by Seller'
		  , Despatched			  : 'Product Despatched'
		  , Done 				  : 'Product Delivered'
	},
	split 						  :
	{
			Transit 			  : 'Transit'
	},
	category 					  :
	{
		  Food 					  : 'Food'
		, Eltx					  : 'Electronics'
	},
	entry 						  :
	{
		  Debit					  : 'Debit'
		, Credit 				  : 'Credit'
	}
	, account					  :
	{
		  Seller				  : 'Seller A/c'
		, Client				  : 'Client A/c'
		, Agent				  	  : 'Agent A/c'
		, System				  : 'System A/c'
		, PSP			  	  	  : 'Payment Service Provider A/c'
		, PGW				  	  : 'Payment Gateway A/c'
		, Bank				  	  : 'Bank A/c'
		, Transit				  : 'Transit A/c'
		, Platform			  	  : 'Platform A/c'
	},
	acctype						  :
	{
		  Asset					  : 'Asset'
		, Liability 			  : 'Liability'
		, Income 				  : 'Income'
		, Expense			      : 'Expense'
	},
	reason:
	{
		  MapQueryFailed 			: 'Google map query failed'
		, ClientNotFound 			: 'Client not found'
		, ClientFound 			    : 'Client exists'
		, IncorrectCredentials      : 'Incorrect clientname or password'
		, MobileNoNotConfirmed      : 'Mobile number not confirmed'
		, IncompleteRegistration    : 'Registration has not completed'
		, PasswdResetNotPermited    : 'Password reset not permited'
		, ProfileUpdated            : 'Profile updated'      
		, TokenMissing              : 'Token missing'
		, AdditionFailed 	        : 'Database addition failed' 
		, DBInsertionFailed         : 'Database insertion failed' 
		, DBRemovalFailed           : 'Database removal failed'
		, DBDeletionFailed          : 'Database deletion failed'
		, DBUpdationFailed          : 'Database updation failed'
		, NoHandlerFound            : 'No handler found'
		, OtpRejected               : 'OTP rejected' 
		, Internal 			        : 'Internal'   
		, SellerExists              : 'Seller exists, use another name or number'
		, ProductExists             : 'Product Exists'
		, MutiSellerNotSupported    : 'Multiseller purchase not supported'
		, BadState                  : 'Bad machine state'
		, ProductNotFound           : 'Product not found'
		, ProductUnavailable 		: 'Product unavailable'
		, SellerNotFound            : 'Seller not found'
		, SellerClosed 				: 'Seller Closed'
		, GracePeriodExceeded 		: 'Seller checkout grace period exceeded'
		, ArbiterNotFound           : 'Arbiter not found'
		, StaffNotFound             : 'Staff not found'
		, UnapprovedSeller          : 'Unapproved Seller'
		, StaffExists               : 'Staff already exists'
		, CartNotFound              : 'Cart not found'
		, NoProductsFound           : 'No products found'
		, PageNotFound              : 'Page not found'
		, BadSignature              : 'Bad signature'
		, JournalNotFound           : 'Journal not found'
		, TransitNotFound           : 'Transit not found'
		, CancellationDenied        : 'On transit, cancellation denied'
		, UnknownTask 				: 'Unknown task'
		, Unknown                   : 'Unknown'
		, Unauthorized              : 'Unauthorized'
		, NoContextFound            : 'No context found'
		, AddressNotFound           : 'Address not found'
		, AddressLimitExceeded      : 'Address limit exceeded'
		, NoAddressFound            : 'No address found'
		, NoSocketFound             : 'No socket found'
		, AgentNotFound             : 'Agent not found'
		, AgentNotAvailable			: 'Agent is not on duty'
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
		, SellerClosed				: 'Seller Closed'
		, NoJournal					: 'No Journal'
		, LedgerNotFound			: 'Ledger Not Found'
	},
	text:
	{
		  OTPGenerated           	: 'OTP Generated'
		, OTPSend                   : 'OTP Send'
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
		  AddressCount 			: 16			// Max allowed address count / client
		, ProductCount 			: 32			// Max count for cart elements
		, SocketCount 			: 3
		, CheckoutGracePeriod 	: 18
	},
	note:
	{
		  Terms 				: 'Terms and Conditions'  
		, Policy 				: 'Privacy Policy' 
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
		, RefundFailure 		: 'FAILED'
		, RefundSuccess 		: 'SUCCESS'

		, Type 					:
		{
			REFUND				: 'REFUND'
		}
		, ReadTimeout 			: 80000
		, TokenExpiry			: 15 	// 15 minutes
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
		, ByClientID				: 'ByClientID'
	},
	mode:
	{
		  Client 				: 'Client'
		, Agent 				: 'Agent'
		, Arbiter 				: 'Arbiter'
		, Seller 				: 'Seller'
		, Paytm					: 'Paytm'
		, System 				: 'System'
		, Enabled 				: 'HasModeEnabled'
	},
	source:
	{
		  Client 				: 'Client'
		, Agent 				: 'Agent'
		, Arbiter 				: 'Arbiter'
		, Seller				: 'Seller'
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
		, LoggedIn 				: 'Logged In'
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
		, Pending 				: 'Pending'
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
		, Initiated 			: 'Initiated'				// Payment had succeeded
		, Cancelled 			: 'Cancelled'				// Order canceled by client 									#Exit By Client
		, Rejected 				: 'Rejected' 				// Order rejected by the shop 								#Exit By Seller
		, Assigned 				: 'Assigned' 				// Order assigned to the agent
		, TimeExceeded 			: 'TimeExceeded'			// Order acceptance time limit for shop has been exceeded	#Exit By Client
		, Accepted 				: 'Accepted'				// Order accpeted by shop
		, Processed				: 'Processed'				// Order processed by shop
		, OnHold 				: 'OnHold'					// Order on hold due to no nearby live agents
		, Despatched 			: 'Despatched'				// Order gave to agent by shop
		, Ignored 				: 'Ignored'				// Agent manually ingored the transit
		, Timeout 				: 'Timeout'				// Agent transit acceptance deadline exceeded
		, Abandoned				: 'Abandoned'
		, Rejected 				: 'Rejected'				// Agent droped/rejected the transit after acceptance
		, Enroute 				: 'Enroute'				// The package is on the way.[state in hold, not decided]
		, OnDrift 				: 'OnDrift'				// Agent needs help on the way of delivery
		, Terminated 			: 'Terminated'			// 															#Exit By Seller
		, Completed 			: 'Completed'			// The package delivered									#End
	},
	delay:	// In Minutes
	{
		  SellerRespLimit		: 5								// Order acceptace delay for shops
		, AgentRespLimit 		: 3 							// Transit acceptace delay for agents
		, AgentFilterLimit 		: 8 							// Time upper limit to find an agent for delivery
		, ArbiterRespLimit 		: 5
	},
	event:
	{
		  Init		: 'Init'			// event cargo initiated by client
		, Cancel	: 'Cancel'			// event cargo cancellation by client
		, Reject	: 'Reject'			// event order rejection by shop
		, Timeout	: 'Timeout'			// event order acceptance timeout
		, Accept	: 'Accept'			// event order acception by shop
		, Commit	: 'Commit'			// event order committed by agent
		, Ready		: 'Ready'
		, Despatch	: 'Despatch'			// event order despatchment by shop
		, Ignore	: 'Ignore'			// event transit ignorance by agent
		, Assign	: 'Assign'
		, Quit		: 'Quit'
		, Terminate	: 'Terminate'
		, Done		: 'Done'			// event tranist completion by agent
		, ResendOTP : 'ResendOTP'


		, Create 	: 'Create'
		, Confirm 	: 'Confirm'
		, Register 	: 'Register'
		, Edit 		: 'Edit'
		, View 		: 'View'
		, Approve 	: 'Approve'
		, List 		: 'List'
	},
	alerts:
	{
		  NewOrder 				: 'New_Order'					// to shop 		   on init
		, Rejected 				: 'Rejected'					// to client 		   on rejection by shop
		, Cancelled 			: 'Cancelled'					// to shop 		   on cancel by client
		, Accepted 				: 'Accepted'					// to client 		   on acceptance from shop
		, Processed 			: 'Processed'					// to agent/client   on readiness from shop
		, AutoCancelled 		: 'Auto_Cancelled'				// to client/shop    on outstanding delay
		, NewTransit 			: 'New_Transit'					// to agents 	   on acceptance from shop
		, AgentReady 			: 'Agent_Ready'					// to shop/client    on acceptance from agent 
		, EnRoute 				: 'En_Route'					// to agent/client   on despachement from shop
		, Delivered 			: 'Delivered'					// to client/shop    on delivery
		, Ignored 				: 'Ignored'						// to none		   
		, NoAgents 				: 'No_Agents'					// to arbiter 	   on absents of live agents
		, SellerTimeout			: 'Timeout_By_Seller'
		, Locked 				: 'Arbiter_Locked'				// to other arbiters on an arbiter choose a ticket
		, Assigned 				: 'Agent_Assigned'
		, Terminated			: 'Order_Terminated'
		, Scheduled 			: 'Scheduled'
		, OTPSend 				: 'OTP_Send'
	},
	entity:
	{
		  Client 				: 'Client'						// the client
		, Seller 				: 'Seller'						// the seller
		, Agent 				: 'Agent'						// the agent
		, Arbiter 				: 'Arbiter'						// the arbiter
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
		, client				: 'client'
		, agent					: 'agent'
		, arbiter 				: 'arbiter'		
		, paytm					: 'paytm'
		, seller				: 'seller'
		, product				: 'product'
		, cart					: 'cart'
		, address				: 'address'
		, checkout				: 'checkout'
		, journal				: 'journal'
		, transit				: 'transit'
		, socket 				: 'socket'
		, cloudinary 			: 'cloudinary'	
		, note 					: 'note'
		, ledger				: 'ledger'		
	},
	verb:
	{
		  root					: '/'
		, create				: 'create'
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
		, client				: 'client'
		, seller				: 'seller'
		, agent					: 'agent'
		, arbiter				: 'arbiter'
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
		  client				: 'client'
		, agent					: 'agent'
		, arbiter				: 'arbiter'			  
		, socket				: 'socket'
		, address				: 'address'
		, seller				: 'seller'
		, product				: 'product'
		, cart					: 'cart'
		, journal				: 'journal'
		, transit				: 'transit'
		, channel				: 'channel'
		, tags 					: 'tags'
		, note 					: 'note'
		, ledger 				: 'ledger'
	},
	segment:
	{
		    db 					: 'db'
		  , route 				: 'route'
	}
}