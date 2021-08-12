const { ObjectId }           = require('mongodb')
    , { Err_, code, reason } = require('../../common/error')
    , { journals }           = require('../../common/database')

const GetByID    = async function(_id)
{
    console.log('find-journal-by-id', { ID : _id })

    const query = { _id : ObjectId(_id) }

    let journal = await journals.findOne(query)
    if (!journal)
    {
      console.log('journal-not-found', { ID : query })
      return
    }
    console.log('journal-found', { Journal : journal })
    return journal
}

const Save       = async function(data)
{
    console.log('save-journal', { Journal : data })
    const query = { _id    : data._id }
        , act   = { $set   : data     }
        , opt   = { upsert : true     }
    const resp  = await journals.updateOne(query, act, opt)
    if (!resp.result.ok)
    {
        console.log('journal-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    console.log('journal-saved', { Journal : data })
}

module.exports =
{
    GetByID : GetByID
  , Save    : Save
}