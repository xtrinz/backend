const { verb, method, note } = require('../../../system/models')

module.exports =
{
    [verb.view]                :
    {
      [method.get]             :
      {
          'query'                 : [ 'required', 'object' ]
        , 'headers'               : [ 'required', 'object' ]
        , 'query.Type'            : [ 'required', 'string', [ 'in', note.Terms, note.Policy, note.Help ]]
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]
      }
    }
  , [verb.set]              :
    {
      [method.post]            : 
      {
          'body'                  : [ 'required', 'object' ]

        , 'body.Type'             : [ 'required', 'string', [ 'in', note.Terms, note.Policy, note.Help ]]
        , 'body.Body'             : [ 'required', 'string' ]

        , 'headers'               : [ 'required', 'object' ]            
        , 'headers.authorization' : [ 'required', 'string', [ 'length', 500, 8 ] ]      
      }
    }
}