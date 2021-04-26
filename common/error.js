class Error_
{
  constructor(code, status, reaon) 
  {
    this.Code = code
    this.Status = status
    this.Reaon = reaon
  }
}
module.exports =
{
  Err: Error_,
  status:
	{
		  Success 					  : 'Success'
		, Failed 			        : 'Failed'
	},
	reason:
	{
		  PurchaseNotFound 		: 'PurchaseNotFound'		
    , UserNotFound 			  : 'UserNotFound'
		, Internal 			      : 'Internal'    
	},
  code:
  {
        OK                : 200
      , ACCEPTED          : 202
      , BAD_REQUEST       : 400
      , UNAUTHORIZED      : 401
      , FORBIDDEN         : 403
      , NOT_FOUND         : 404
      , CONFLICT          : 409
      , INTERNAL_SERVER   : 500
  }
}