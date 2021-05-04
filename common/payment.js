const { states } = require("../machine/models")
// ProcessMonetaryReturns represents update utility 
// to set-compenstaion-counters or initiate refund
// on every transit for Agent/ User/ Admin
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