const { db } = require('../../../sys/database')
    , Model  = require('../../../sys/models')
    , Log    = require('../../../sys/log')

const Get    = async function(type)
{
    let query = { Type: type }
    Log('find-note', { Query : query })

    const note = await db().notes.findOne(query)
    if (!note)
    {
      Log('note-not-found', { Query : query })
      Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.NoteNotFound)
    }
    Log('note-found', { Note : note })
    return note
}

const Save       = async function(data)
{
    Log('save-note', { Note : data })
    const query = { Type   : data.Type }
        , act   = { $set   : data      }
        , opt   = { upsert : true      }
    const resp  = await db().notes.updateOne(query, act, opt)
    if (!resp.acknowledged)
    {
        Log('note-save-failed', { 
            Query   : query
          , Action  : act
          , Option  : opt
          , Result  : resp.result})

        Model.Err_(Model.code.INTERNAL_SERVER, Model.reason.AdditionFailed)
    }
    Log('note-saved', { Note : data })
}

module.exports =
{
      Get   : Get
    , Save  : Save
}