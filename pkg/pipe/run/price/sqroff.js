const Log    = require('../../../sys/log')
    , { db } = require('../../../sys/database')
    , Model  = require('../../../sys/models')

const Settle = async function(journal)
{
    let rcd, write = [], e1, e2, dt, ct
    for(let i = 0; i < journal.Book.length; i++)
    {
        rcd = journal.Book[i]

        dt  = rcd.Note[0] // Debit
        ct  = rcd.Note[1] // Credit

        e1  =
        { 
            updateOne           :
            {
               filter           : { 'Head.ID' : dt.ID },
               update           : 
               {
                    $inc        : { 'Balance.Amount' : dt.Amount }
                 , $push        : 
                 { 
                    Debit       :
                    [{
                        ID        : ct.ID
                      , Account   : ct.Account
                      , Owner     : ct.Owner
                      , Amount    : ct.Amount
                      , Cause     : rcd.Description
                      , Event     : rcd.Event
                      , Time      : rcd.Time
                      , JournalID : journal._id
                    }]
                 }
               }
            }
        }
        write.push(e1)
        e2  =
        { 
            updateOne           :
            {
                filter           : { 'Head.ID' : ct.ID },
                update           : 
                {
                       $inc        : { 'Balance.Amount' : -1 * ct.Amount }
                    , $push        : 
                    { 
                        Credit   :
                        [{
                              ID        : dt.ID
                            , Account   : dt.Account
                            , Owner     : dt.Owner
                            , Amount    : dt.Amount
                            , Cause     : rcd.Description
                            , Event     : rcd.Event
                            , Time      : rcd.Time
                            , JournalID : journal._id
                        }]
                    }
                }
            }
        }
        write.push(e2)
    }
    Log('ledger-posting-failed', JSON.stringify({ Query : write }))
    const resp = await db().ledgers.bulkWrite(write)
    if (!resp.ok)
    {
        Log('ledger-posting-failed', { Query : write })
        Log('ledger-posting-failed', JSON.stringify(resp))        
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
        return
    }

    Log('posted-to-ledger', { Data : write })    
}

module.exports = Settle