                 require('./settings')
const express  = require('express')
    , fs       = require('fs')
    , app      = express()
    , https    = require('https')
    , port     = process.env.PORT
    , adptr    = require( '../pkg/system/adapter'       )
    , { test } = require( '../pkg/system/test'          )
    , note     = require( '../pkg/config/note/route'    )
    , user     = require( '../pkg/config/user/route'    )
    , agent    = require( '../pkg/config/agent/route'   )    
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
    }          = require('../pkg/system/models')
    , options  =
    {
          key  : fs.readFileSync('cert/server.key')
        , cert : fs.readFileSync('cert/server.crt')
    }

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use( v.v1.slash(rsrc.test)    , test     )
app.use( adptr.SecInput                      )
app.use( v.v1.slash(rsrc.paytm)   , paytm    )
app.use( adptr.Authnz                        )
app.use( v.v1.slash(rsrc.note)    , note     )
app.use( v.v1.slash(rsrc.user)    , user     )
app.use( v.v1.slash(rsrc.agent)   , agent    )
app.use( v.v1.slash(rsrc.store)   , store    )
app.use( v.v1.slash(rsrc.product) , product  )
app.use( v.v1.slash(rsrc.cart)    , cart     )
app.use( v.v1.slash(rsrc.address) , address  )
app.use( v.v1.slash(rsrc.journal) , journal  )
app.use( v.v1.slash(rsrc.transit) , transit  )
app.use( v.v1.slash(rsrc.root)    , common   )
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
    , socket  = require('../pkg/config/socket/handle')
    , event   = require('../pkg/engine/events')

      adptr.SetServer(server, io)
      event.SetChannel(io)
      server.listen(port, server_)

io.on('connection', async (socket_) =>
{
    await socket.Connect(socket_)
    const disc_ = async ()=> await socket.Disconnect(socket_)
    socket_.on('disconnect', disc_)
})
