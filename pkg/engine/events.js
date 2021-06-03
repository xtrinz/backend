const Emitter = require('events')
const emitter = new Emitter

/*
    Sender API for events
 */
const Emit = async function(msg)
{
    if (!msg.To.length)
    {
        console.log('no-live-end-points-found-emission-dropped', msg)
        return
    }
    console.log('emit-message', msg)

    try         { await emitter.emit('SendEvent', msg)     } 
    catch(err)  { console.log('emission-failed', err, msg) }
}

/*
    1. Authenticate user
    2. Create sock_id-vs-user lookup
    3. Push sock_id to user record
    4. Push sock_id to transaction record if any
*/
const Connect = function(socket)
{
    console.info('client-connected', socket.id, socket.handshake.auth)
    /*
        sock_id
        auth.user_id
        auth.token
    */
}

/*
    1. Pull sock_id from transit record if any
    2. Pull sock_id from user record
    3. Delete sock_id-vs-user lookup
*/
const Disconnect = function(socket)
{
    console.info(`client-disconnected ${socket}`)
}

module.exports =
{
      Emit        :   Emit
    , Channel     :   emitter
    , Connect     :   Connect
    , Disconnect  :   Disconnect
}