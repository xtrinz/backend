                 require('./settings')
const express  = require('express')
    , app      = express()
    , port     = process.env.PORT
    , adptr    = require( '../pkg/common/adapter'       )
    , { test } = require( '../pkg/common/test'          )
    , user     = require( '../pkg/config/user/route'    )
    , store    = require( '../pkg/config/store/route'   )
    , product  = require( '../pkg/config/product/route' )
    , cart     = require( '../pkg/config/cart/route'    )
    , address  = require( '../pkg/config/address/route' )
    , journal  = require( '../pkg/config/journal/route' )
    , transit  = require( '../pkg/config/transit/route' )
    , common   = require( '../pkg/config/generic/index' )

app.use(express.urlencoded({ extended: true  }))
const stripe_ = function (req, res, buf)
{
  if (req.originalUrl.startsWith('/journal/confirm')) 
    req.RawBody = buf.toString()
}
app.use(express.json(      { verify: stripe_ }))

app.use( '/test'    , test    )
app.use( '/user'    , user    )
app.use( adptr.Auth           )
app.use( '/store'   , store   )
app.use( '/product' , product )
app.use( '/cart'    , cart    )
app.use( '/address' , address )
app.use( '/journal' , journal )
app.use( '/transit' , transit )
app.use( '/'        , common  )
app.use( adptr.Forbidden      )
app.use( adptr.ErrorHandler   )

const excp_ = (err) => console.log(err)
process.on('unhandledRejection', excp_)
const sce_  =
[ 
      'uncaughtException' //, 'exit'
    , 'SIGINT'            //, 'SIGKILL'
//  , 'SIGTERM'
]
sce_.forEach((type) => process.on(type, adptr.GracefulExit))

const server_ = () => console.log('server-started', {Port : port})
    , server        = app.listen(port, server_)
    , io            = require('socket.io')(server)
    , event         = require('../pkg/engine/events')
      adptr.SetServer(server, io)

io.on('connection', async (socket) =>
{
    await event.Connect(socket)
    const disc_ = async ()=> await event.Disconnect(socket)
    socket.on('disconnect', disc_)
})

event.Channel.on('SendEvent', async (data)=>
{
  console.info('Sending-event', data)
  try        { await io.to(data.To).emit('Event', data.Msg) } 
  catch(err) { console.log('emission-error', { Err: err, Data: data} )     }
})
