const { states } = require("./models")
const ProcessMonetaryReturns = function(ctxt)
{
    switch (ctxt.State)
    {
        case states.TranistCompleted:
            break
        case states.CargoCancelled  :
            break
        case states.OrderRejected   :
            break
        case states.TransitRejected :
            break
    }
}
module.exports =
{
    ProcessMonetaryReturns: ProcessMonetaryReturns
}