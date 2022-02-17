const Model  = require('../../../sys/models')
    , db     = require('../../exports')[Model.segment.db]
    , jwt    = require('../../../infra/jwt')
    , input  = require('../../../sys/input')
    , Log    = require('../../../sys/log')
    , cache  = require('../../../infra/cache')

let Channel
const SetChannel = (io_) => { Channel = io_ }

const Connect = async function(socket_)
{
  try
  {
    const inst = new input.Controller()
    await inst.IsHonest(socket_, Model.resource.socket, Model.verb.connect, Model.method.void)

    const token   = String(socket_.handshake.auth.Token)
        , resp    = await jwt.Verify(token)

    let data, sock_id
    switch(resp.Mode)
    {
      case Model.mode.Seller  : data = await db.seller.Get(resp._id, Model.query.ByID);   break
      case Model.mode.Agent   : data = await db.agent.Get(resp._id, Model.query.ByID);    break
      case Model.mode.Arbiter : data = await db.arbiter.Get(resp._id, Model.query.ByID);  break
      case Model.mode.Client  : data = await db.client.Get(resp._id, Model.query.ByID);   break
    }

      if (!data)
      {
          Log('entity-not-found', { Detail: resp })
          Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
      }

    cache.SetID(data._id, resp.Mode, socket_.id)
    
    let sck_lst = cache.GetByRoleID(data._id, resp.Mode)
    if(sck_lst.length > Model.limits.SocketCount)
    {
      sock_id = sck_lst[0]
      const socket_a  = await Channel.sockets.sockets.get(sock_id)
      await Disconnect(socket_a)
      socket_a.disconnect()
    }

    Log('connected', { Data : data, SockID : socket_.id })

  } catch(err) 
  {
    Log('socket-auth-failed', {Error : err })
    try         { await socket_.disconnect() }
    catch(err_) { Log('disconnection-failed', {Err: err_ }) }   
  }
}

const Disconnect = async function(socket_)
{
  try
  {
    
    const inst = new input.Controller()
    await inst.IsHonest(socket_, Model.resource.socket, Model.verb.disconnect, Model.method.void)

    const sckt  = cache.GetBySockID(String(socket_.id))
    let data
    switch(sckt.Mode)
    {
      case Model.mode.Seller:   data = await db.seller.Get  (sckt._id, Model.query.ByID); break
      case Model.mode.Agent:    data = await db.agent.Get   (sckt._id, Model.query.ByID); break
      case Model.mode.Arbiter:  data = await db.arbiter.Get (sckt._id, Model.query.ByID); break
      case Model.mode.Client:   data = await db.client.Get  (sckt._id, Model.query.ByID); break
    }

    if (!data)
    {
        Log('client-not-found', { ClientID: sckt._id })
        Model.Err_(Model.code.BAD_REQUEST, Model.reason.InvalidToken)
    }

    cache.RemoveID(data._id, sckt.Mode, String(socket_.id))

    Log('client-disconnected', { Client : data, SockID : socket_.id })
  }
  catch(err)
  { Log('client-disconnection-failed', {Err : err }) }

}

module.exports = { Connect , Disconnect, SetChannel }