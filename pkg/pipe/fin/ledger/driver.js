const Model  = require('../../../sys/models')
    , db     = require('../../exports')[Model.segment.db]
    , Log    = require('../../../sys/log')
    , Ledger = require('./model')

const System = async function()
{

    Log('create-system-ledgers', {})

    let lrs = 
    [
      { Mode : Model.mode.System, ID : Model.account.System  , Name : Model.account.System   , Type : Model.acctype.Asset   },
      { Mode : Model.mode.System, ID : Model.account.Transit , Name : Model.account.Transit  , Type : Model.acctype.Income  },
      { Mode : Model.mode.System, ID : Model.account.Platfrom, Name : Model.account.Platfrom , Type : Model.acctype.Income  },
      { Mode : Model.mode.System, ID : Model.account.PSP     , Name : Model.account.PSP      , Type : Model.acctype.Expense },
      { Mode : Model.mode.System, ID : Model.account.PGW     , Name : Model.account.PGW      , Type : Model.acctype.Asset   },
      { Mode : Model.mode.System, ID : Model.account.Bank    , Name : Model.account.Bank     , Type : Model.acctype.Asset   }
    ]

    await db.ledger.BulkCreate(lrs)
}

const Create = async function(data)
{
    Log('Create-ledger', { Input: data })

    let led = 
    {
         Mode   : data.Mode
       , ID     : data._id
       , Name   : data.Name
       , Type   : Model.acctype.Liability
    }
    let ledr = new Ledger(led)

    await db.ledger.Create(ledr)

    Log('ledger-created', { Ledger: ledr })
    return ledr._id
}

/*
const Read = async function(data)
{
    Log('read-ledger', data)

    const ledger = await db.ledger.Read(data.LedgerID)

    return ledger
}

const List = async function(data)
{
    Log('list-ledger', { Data : data })

    const list = await db.ledger.List(data)

    return list
}
module.exports = {  Read, List, System }
*/

module.exports = { Create, System }