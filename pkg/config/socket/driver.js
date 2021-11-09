const Model = require('../../system/models')
    , db    = require('../exports')[Model.segment.db]
class Socket
{
    static async Insert(data, mode_, sock_id)
    {
        const opt = { Client: data, Mode: mode_, SockID: sock_id }

        console.log('insert-sock-id', opt)

        await db.socket.Insert(data._id, mode_, sock_id)

        await db.transit.SetSockID(mode_, data._id, sock_id)

        console.log('user-sock-id-set', opt)
    }

    static async Remove(data, mode_, sock_id)
    {
        const opt = { Client: data, Mode: mode_, SockID: sock_id }

        console.log('remove-sock-id', opt)

        await db.socket.Remove(data._id, mode_, sock_id)

        await db.transit.ClearSockID(data._id, sock_id)

        console.log('sock-id-poped', opt)
    }
}

module.exports = Socket