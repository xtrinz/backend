
// logging frame work
function Log (text, params)
{
    console.log(JSON.stringify({ Message: text, Data: params }))
}

module.exports = Log