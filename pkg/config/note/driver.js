const { ObjectID } = require('mongodb')
    , db           = require('../note/archive')

class Note
{
    constructor(data)
    {
        this._id          = new ObjectID()
        this.Type         = data.Type
        this.Body         = data.Body
    }

    static async Read(type)
    {
        console.log('read-note', { Type: type })
        const note = await db.Get(type)
        delete note._id
        return note
    }

    static async Set(data)
    {
        console.log('update-note', { Note : data })

        let note =
        {
              Type : data.Type
            , Body : data.Body
        }

        await db.Save(note)
    }
}

module.exports = 
{
    Note : Note
}