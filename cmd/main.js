                 require('./settings')
const express  = require('express')
    , fs       = require('fs')
    , app      = express()
    , https    = require('https')
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
    , paytm    = require( '../pkg/config/generic/pgw'   )
    , 
    {
      resource : rsrc,
      version  : v
    }          = require('../pkg/common/models')
    , options  =
    {
          key  : fs.readFileSync('cert/server.key')
        , cert : fs.readFileSync('cert/server.crt')
    }

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use( v.v1 + rsrc.test    , test     )
app.use( v.v1 + rsrc.paytm   , paytm    )
app.use( adptr.Authnz                   )
app.use( v.v1 + rsrc.user    , user     )
app.use( v.v1 + rsrc.store   , store    )
app.use( v.v1 + rsrc.product , product  )
app.use( v.v1 + rsrc.cart    , cart     )
app.use( v.v1 + rsrc.address , address  )
app.use( v.v1 + rsrc.journal , journal  )
app.use( v.v1 + rsrc.transit , transit  )
app.use( v.v1 + rsrc.root    , common   )
app.use( adptr.Forbidden                )
app.use( adptr.ErrorHandler             )

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
    , server  = https.createServer(options, app)
    , io      = require('socket.io')(server)
    , event   = require('../pkg/engine/events')

      adptr.SetServer(server, io)
      event.SetChannel(io)
      server.listen(port, server_)

io.on('connection', async (socket) =>
{
    await event.Connect(socket)
    const disc_ = async ()=> await event.Disconnect(socket)
    socket.on('disconnect', disc_)
})