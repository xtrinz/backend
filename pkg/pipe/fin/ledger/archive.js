const { db }  = require('../../../sys/database')
    , Model   = require('../../../sys/models')
    , Log     = require('../../../sys/log')
    , cache   = require('../../../infra/cache')
    , Ledger  = require('./model')

const BulkCreate = async function (data)
{
    for(let i = 0; i < data.length; i++)
    {
        Log('insert-ledger', { Data: data[i] })
        data[i] = new Ledger(data[i])

        const query = { 'Head.ID' : data[i].Head.ID }
            , resp  = await db().ledgers.findOne(query)
        if (resp)
        {
            Log('ledger-already-exists', { Query: query, Resp: resp })
            cache.SetAcc(data[i].Head.ID, resp._id)
            continue
        }
        // insert record
        let re = await db().ledgers.insertOne(data[i])
        if (!re.acknowledged)
        {
            Log('ledger-insertion-failed', { Data: data[i] })
            process.exit(1)
        }

        cache.SetAcc(data[i].Head.ID, re.insertedId)

        Log('ledger-inserted', { Data: data[i] })
    }
}

const Create     = async function (data)
{
    console.log('create-ledger', { Ledger: data })

    const resp   = await db().ledgers.insertOne(data)
    if (!resp.acknowledged)
    {
        Log('ledger-insertion-failed', { Result: resp.result } )
        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.DBInsertionFailed)
    }

    Log('ledger-created', { Ledger: data })
}

module.exports = { BulkCreate, Create }