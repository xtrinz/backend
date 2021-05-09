class Error_
{
  constructor(code, status, reaon) 
  {
    this.Code   = code
    this.Status = status
    this.Reaon  = reaon
  }
}

module.exports =
{
  Err                           : Error_,
  status:
	{
		  Success 					        : 'Success'
		, Failed 			              : 'Failed'
	},
	reason:
	{
		  PurchaseNotFound 		      : 'Purchase not found'
    , UserNotFound 			        : 'User not found'
    , UserFound 			          : 'User exists'
    , IncorrectCredentials      : 'Incorrect username or password'
    , MobNoNotConfirmed         : 'Mobile number not confirmed'
    , IncompleteRegistration    : 'Registration has not completed'
    , PasswdResetNotPermited    : 'Password reset not permited'
    , ProfileUpdated            : 'Profile updated'      
    , TokenMissing              : 'Token missing'
    , DBAdditionFailed 	        : 'Database addition failed' 
    , DBInsertionFailed         : 'Database insertion failed' 
    , DBRemovalFailed           : 'Database removal failed'
    , DBDeletionFailed          : 'Database deletion failed'
    , DBUpdationFailed          : 'Database updation failed'
    , MachineHandlerNotFound    : 'Transit machine handler not found' 
    , OtpRejected               : 'OTP rejected' 
		, Internal 			            : 'Internal'   
    , StoreExists               : 'Store exists, use another name or number'
    , ProductExists             : 'Identical name found'
    , BadState                  : 'Bad machine state'
    , ProductNotFound           : 'Product not found'
    , StoreNotFound             : 'Store not found'
    , AdminNotFound             : 'Admin not found'
    , StaffNotFound             : 'Staff not found'
    , UnapprovedSotre           : 'Unapproved Store'
    , StaffExists               : 'Staff already exists'
    , CartNotFound              : 'Cart not found'
    , NoProductsFound           : 'No products found'
    , PageNotFound              : 'Page not found'
    , BadSignature              : 'Bad signature'
    , JournalNotFound           : 'Journal not found'
    , TransitNotFound           : 'Transit not found'
	},
  text:
  {
      OTPSendToMobNo            : 'OTP has been send to number ending with {0}'
    , OTPSend                   : 'OTP Send'
    , OTPSendVia                : 'OTP send via {0}'
    , OTPConfirmed              : 'OTP confirmed'
    , Registered                : 'Registered'
    , Approved                  : 'Approved'
    , LoggedIn                  : 'Logged in'
    , PasswdUpdated             : 'Password updated'
    , ProductAdded              : 'Product added'
    , ProductUpdated            : 'Product updated'
    , ProductRemoved            : 'Product removed'
    , NoDataFound               : 'No data found'
    , AddressAdded              : 'Address added'
    , AddressUpdated            : 'Address updated'
    , AddressRemoved            : 'Address removed'
    , WaitingForStaffReply      : 'Waiting for staff reply'
    , ResponseUpdated           : 'Response updated'
    , NoContextFound            : 'No context found'
    , Relieved                  : 'Relieved'
    , Server                    : 'Server running on port {0}'
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