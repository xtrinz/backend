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
        Success 					        : 'Success'
      , Failed 			              : 'Failed'
      , Pending                   : 'Pending'
    }
    , Err_     = (code, reason) => { throw new Error_(code, status.Failed, reason) }

module.exports =
{
  Err_                          : Err_,
  Err                           : Error_,
  status                        : status,
	reason:
	{
		  PurchaseNotFound 		      : 'Purchase not found'
    , UserNotFound 			        : 'User not found'
    , UserFound 			          : 'User exists'
    , IncorrectCredentials      : 'Incorrect username or password'
    , MobileNoNotConfirmed         : 'Mobile number not confirmed'
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
		, Internal 			            : 'Internal'   
    , StoreExists               : 'Store exists, use another name or number'
    , ProductExists             : 'Product Exists'
    , MutiStoreNotSupported     : 'Multistore purchase not supported'
    , BadState                  : 'Bad machine state'
    , ProductNotFound           : 'Product not found'
    , StoreNotFound             : 'Store not found'
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
	},
  text:
  {
      OTPSendToMobileNo            : 'OTP has been send to number ending with {0}'
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
  }
}