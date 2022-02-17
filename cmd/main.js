      require('./settings')
const adptr    = require( '../pkg/sys/adapter'             )

      adptr.BringUp()

const express  = require('express')
    , helmet   = require('helmet')
    , compress = require('compression')
    , fs       = require('fs')
    , app      = express()
    , https    = require('https')
    , port     = process.env.PORT
    , { test } = require( '../pkg/sys/test'                )
  
    , client   = require( '../pkg/pipe/role/client/route'  )
    , agent    = require( '../pkg/pipe/role/agent/route'   )
    , arbiter  = require( '../pkg/pipe/role/arbiter/route' )
    , seller   = require( '../pkg/pipe/role/seller/route'  )

    , product  = require( '../pkg/pipe/fin/product/route'  )
    , cart     = require( '../pkg/pipe/fin/cart/route'     )
    , address  = require( '../pkg/pipe/fin/address/route'  )
    , note     = require( '../pkg/pipe/fin/note/route'     )
    , common   = require( '../pkg/pipe/fin/generic/index'  )
    , paytm    = require( '../pkg/pipe/fin/generic/pgw'    )
    , ledger   = require( '../pkg/pipe/fin/ledger/route'   )

    , journal  = require( '../pkg/pipe/run/journal/route'  )
    , transit  = require( '../pkg/pipe/run/transit/route'  )
    , 
    {
      resource : rsrc,
      version  : v
    }          = require('../pkg/sys/models')
    , options  =
    {
          key  : fs.readFileSync(process.env.CERT_PATH + 'server.key')
        , cert : fs.readFileSync(process.env.CERT_PATH + 'server.crt')
    }
    , Log      = require('../pkg/sys/log')

app.use(compress())
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use( v.v1.slash(rsrc.test)    , test     )
app.use( adptr.SecInput                      )
app.use( v.v1.slash(rsrc.paytm)   , paytm    )
app.use( adptr.Authnz                        )
app.use( v.v1.slash(rsrc.note)    , note     )
app.use( v.v1.slash(rsrc.client)  , client   )
app.use( v.v1.slash(rsrc.agent)   , agent    )
app.use( v.v1.slash(rsrc.arbiter) , arbiter  )
app.use( v.v1.slash(rsrc.seller)  , seller   )
app.use( v.v1.slash(rsrc.product) , product  )
app.use( v.v1.slash(rsrc.cart)    , cart     )
app.use( v.v1.slash(rsrc.address) , address  )
app.use( v.v1.slash(rsrc.journal) , journal  )
app.use( v.v1.slash(rsrc.transit) , transit  )
app.use( v.v1.slash(rsrc.root)    , common   )
app.use( adptr.Forbidden                     )
app.use( adptr.ErrorHandler                  )

const sce_  =
[ 
      'uncaughtException' //, 'exit'
    , 'SIGINT'            //, 'SIGKILL'
//  , 'SIGTERM'
    , 'unhandledRejection'
]
sce_.forEach((type) => process.on(type, adptr.GracefulExit))

const server_ = () => Log('server-started', {Port : port})
    , server  = https.createServer(options, app)
    , io      = require('socket.io')(server)
    , socket  = require('../pkg/pipe/role/socket/handle')
    , event   = require('../pkg/pipe/run/core/events')

      adptr.SetServer(server, io)
      event.SetChannel(io)
      socket.SetChannel(io)      
      server.listen(port, server_)

io.on('connection', async (socket_) =>
{
    await socket.Connect(socket_)
    const disc_ = async ()=> await socket.Disconnect(socket_)
    socket_.on('disconnect', disc_)
})
