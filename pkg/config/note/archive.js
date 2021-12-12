const { db }              = require('../../system/database')
    , { Err_, code, reason } = require('../../system/models')
    , Log                    = require('../../system/log')

const Get    = async function(type)
{
    let query = { Type: type }
    Log('find-note', { Query : query })

    const note = await db().notes.findOne(query)
    if (!note)
    {
      Log('note-not-found', { Query : query })
      Err_(code.INTERNAL_SERVER, reason.NoteNotFound)
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

        Err_(code.INTERNAL_SERVER, reason.DBAdditionFailed)
    }
    Log('note-saved', { Note : data })
}

module.exports =
{
      Get   : Get
    , Save  : Save
}