const stringify = require('json-stringify-safe')
    , deepcopy  = require('deepcopy')
    , rmfile    = require('remove-field')

function Log (text, params)
{
    // let obj = rmfile([ 'Return' ], deepcopy(params)) // deepcopy - Threw error at : Trial : null

    // see: how to keep it on journal as is, ( rename) 
    console.log({ txt: text, ref: params })
    // console.log(stringify({ txt: text, ref: obj }))
    console.log()
}

module.exports = Log