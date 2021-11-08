const Model         = require('../../../system/models')

module.exports = 
{
    [Model.verb.register]     : 
    {
      [Model.method.post]     : 
      {
          'body'                  : [ 'required', 'object' ]
        , 'body.Task'             : [ 'required', 'string', [ 'in', Model.task.New, Model.task.ReadOTP, Model.task.Register ] ]
        , 'body.MobileNo'         : [ [ 'requiredIf', 'body.Task', Model.task.ReadOTP ],
                                      [ 'requiredIf', 'body.Task', Model.task.New ],
                                      [ 'requiredIf', 'body.Task', Model.task.Register], 'string', [ 'length', 15, 2 ] ]
        , 'body.OTP'              : [ [ 'requiredIf', 'body.Task', Model.task.ReadOTP  ], 'integer', [ 'between', 000000, 999999 ] ]
        , 'body.Name'             : [ [ 'requiredIf', 'body.Task', Model.task.Register ], 'string' , [ 'length', 50, 2 ] ]
      }
    }
  , [Model.verb.edit]      :
    {
        [Model.method.put]    : 
        {
            'body'                  : [ 'required', 'object' ]
          , 'headers'               : [ 'required', 'object' ] 
          , 'body.Name'             : [ [ 'requiredWithout', 'Email' ] , 'string', [ 'length', 50, 2 ] ]

          , 'body.Longitude'        : [ 'numeric', [ 'between', -180, 180 ] ]
          , 'body.Latitude'         : [ 'numeric', [ 'between', -90, 90 ] ]  
          , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
        }
    }
  , [Model.verb.view]      :
    {
      [Model.method.get]   : 
      {
          'headers'                 : [ 'required', 'object' ] 
        , 'headers.authorization'   : [ 'required', 'string', [ 'length', 500, 8 ] ]
      } 
    }  
  }