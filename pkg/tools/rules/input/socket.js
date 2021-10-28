const { verb, method } = require('../../../system/models')

module.exports =
{
    [verb.connect]             :
    {
        [method.void]            : 
        {
            'handshake'            : [ 'required', 'object' ]
        , 'handshake.auth'       : [ 'required', 'object' ]
        , 'handshake.auth.Token' : [ 'required', 'string', [ 'length', 500, 8 ] ]                                  
        , 'id'                   : [ 'required', 'string', [ 'length', 100, 1 ] ]
        }
    }
    , [verb.disconnect]          :
    {
        [method.void]              : 
        {
            'id'                   : [ 'required', 'string', [ 'length', 100, 1 ] ]
        }
    }      
}