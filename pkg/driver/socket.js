const db                     =
    {
          socket             : require('../archive/socket')
        , transit            : require('../archive/transit')
    }

function Socket()
{
    this.Data =
    { 
          _id    : ''
        , SockID : ''
    }

    this.Insert     = async function (user, sock_id)
    {
        const opt = { UserID: user.Data._id, SockID: sock_id }

        console.log('insert-sock-id', opt)
        await db.socket.Insert(user.Data._id, sock_id)

        console.log('sock-id-to-agent-transit-rcd', opt)
        await db.transit.SetAgentSockID(user.Data._id, sock_id)

        console.log('sock-id-to-user-transit-rcd', opt)
        await db.transit.SetUserSockID(user.Data._id, sock_id)

        console.log('sock-id-to-store-transit-rcd', opt)
        let str_stores = [ ...user.Data.StoreList.Owned, ...user.Data.StoreList.Accepted ]
        await db.transit.SetStoreSockID(str_stores, sock_id)

        console.log('user-sock-id-set', opt)
    }

    this.Remove     = async function (user, sock_id)
    {
        const opt = { UserID: user.Data._id, SockID: sock_id }

        console.log('remove-sock-id', opt)
        await db.socket.Remove(user.Data._id)

        console.log('sock-id-from-agent-transit-rcd', opt)
        await db.transit.UnsetAgentSockID(user.Data._id, sock_id)

        console.log('sock-id-from-user-transit-rcd', opt)
        await db.transit.UnsetUserSockID(user.Data._id, sock_id)

        console.log('sock-id-from-store-transit-rcd', opt)
        let str_stores = [ ...user.Data.StoreList.Owned, ...user.Data.StoreList.Accepted ]
        await db.transit.UnsetStoreSockID(str_stores, sock_id)

        console.log('user-sock-id-poped', opt)
    }
}

module.exports = 
{
      Socket : Socket
}