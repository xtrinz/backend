module.exports =
{
	states:
    {
		// User
		  None 							: 'None'
        , New 							: 'New'
        , MobConfirmed              	: 'MobileNumberConfirmed'
        , Registered                	: 'Registered'

		// Journal
		, PaymentSuccessTransitSuccess 	: 'Payment-Success-Transit-Success'
		, PaymentSuccessTransitFailed 	: 'Payment-Success-Transit-Failed'
		, PaymentFailedTransitSuccess 	: 'Payment-Failed-Transit-Success'
		, PaymentFailedTransitFailed 	: 'Payment-Failed-Transit-Failed'
    },
	mode:
	{
		  User 							: 'User'
		, Agent 						: 'Agent'
		, Admin 						: 'Admin'
	},

	type:
	{
		  FORWARD 						: 'FORWARD'
		, RETURN 						: 'RETURN'
	},

	task:
	{
		  New							: 'New'
		, ReadOTP 						: 'Read_OTP'
		, GenOTP 						: 'Generate_OTP'
		, ConfirmOTP 					: 'Confirm_OTP'
		, EditPasswd 					: 'Edit_Password'
		, EditProfile 					: 'Edit_Profile'
		, Approve 						: 'Approve'
		, Request						: 'Request'
		, Accept 						: 'Accept'
		, Deny 							: 'Deny'
		, Relieve 						: 'Relieve'
	}
}