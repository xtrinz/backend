const { mode } = require('../../system/models')

const db                     =
    {
          socket             : require('../socket/archive')
        , transit            : require('../transit/archive')
    }

function Socket()
{
    this.Data =
    { 
          _id    : ''
        , SockID : ''
    }
    this.Insert     = async function (data, mode_, sock_id)
    {
        const opt = { Client: data, Mode: mode_, SockID: sock_id }

        console.log('insert-sock-id', opt)
        await db.socket.Insert(data._id, mode_, sock_id)

        switch(mode_)
        {
        case mode.Store:
            console.log('sock-id-to-store-transit-rcd', opt)
            await db.transit.SetStoreSockID(data._id, sock_id)
            break
        case mode.Agent:
            console.log('sock-id-to-agent-transit-rcd', opt)
            await db.transit.SetAgentSockID(data._id, sock_id)
            break
        case mode.Admin:
            console.log('sock-id-to-admin-transit-rcd', opt)
            await db.transit.SetAdminSockID(data._id, sock_id)            
            break
        case mode.User:
            console.log('sock-id-to-user-transit-rcd', opt)
            await db.transit.SetUserSockID(data._id, sock_id)
            break
        }
        console.log('user-sock-id-set', opt)
    }

    this.Remove     = async function (data, mode_, sock_id)
    {
        const opt = { Client: data, Mode: mode_, SockID: sock_id }

        console.log('remove-sock-id', opt)
        await db.socket.Remove(data._id, mode_, sock_id)

        switch(mode_)
        {
        case mode.Store:
            console.log('sock-id-from-store-transit-rcd', opt)
            await db.transit.UnsetStoreSockID(data._id, sock_id)
            break
        case mode.Agent:
            console.log('sock-id-from-agent-transit-rcd', opt)
            await db.transit.UnsetAgentSockID(data._id, sock_id)
            break
        case mode.Admin:
            console.log('sock-id-from-admin-transit-rcd', opt)
            await db.transit.UnsetAdminSockID(data._id, sock_id)            
            break
        case mode.User:
            console.log('sock-id-from-user-transit-rcd', opt)
            await db.transit.UnsetUserSockID(data._id, sock_id)
            break
        }
        console.log('user-sock-id-poped', opt)
    }
}

module.exports = 
{
      Socket : Socket
}