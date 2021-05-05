module.exports =
{
	states:
    {
		  None 						: 'None'
        , New 						: 'New'
        , MobConfirmed              : 'MobileNumberConfirmed'
        , Registered                : 'Registered'
    },
	mode:
	{
		  User 						: 'User'
		, Agent 					: 'Agent'
		, Admin 					: 'Admin'
	},

	task:
	{
		  New						: 'New'
		, ReadOTP 					: 'Read_OTP'
		, GenOTP 					: 'Generate_OTP'
		, ConfirmOTP 				: 'Confirm_OTP'
		, EditPasswd 				: 'Edit_Password'
		, EditProfile 				: 'Edit_Profile'
		, Approve 					: 'Approve'
		, Request					: 'Request'
		, Accept 					: 'Accept'
		, Deny 						: 'Deny'
		, Relieve 					: 'Relieve'
	}
}