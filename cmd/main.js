require("./settings")

const   express = require("express")
      , app     = express()
      , port    = process.env.PORT
      , adptr   = require("../pkg/common/adapter")
      , { text }= require('../pkg/common/error')

      , user    = require('../pkg/routes/user'   )
      , store   = require('../pkg/routes/store'  )
      , product = require('../pkg/routes/product')
      , cart    = require('../pkg/routes/cart'   )
      , address = require('../pkg/routes/address')
      , journal = require('../pkg/routes/journal')
      , transit = require('../pkg/routes/transit')
      , common  = require('../pkg/routes/common' )           
  
const stripe_ = function (req, res, buf)
{ // We need the raw body to verify webhook signatures. Let's compute it only when hitting the Stripe webhook endpoint.
  if (req.originalUrl.startsWith("/journal/confirm")) { req.rawBody = buf.toString() }
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json({ verify: stripe_ }))

app.use("/user"           , user   )
app.use("/journal/confirm", journal) // need to check, how journal/cofirm and journal differs

app.use(adptr.Auth)

app.use("/store"  , store  )
app.use("/product", product)
app.use("/cart"   , cart   )
app.use("/address", address)
app.use("/journal", journal)
app.use("/transit", transit)
app.use("/"       , common )

app.use(adptr.Forbidden    )
app.use(adptr.ErrorHandler )

const excp_ = (err) => { console.log(err) }
process.on(`unhandledRejection`, excp_)
const sce_  = [ `uncaughtException`,
                `exit`, `SIGINT`,
                `SIGKILL`, `SIGTERM`]
//sce_.forEach((type) => process.on(type, adptr.GracefulExit))

const server_ = () => { console.log(text.Server.format(port)) }
     , server = app.listen(port, server_)

     , io     = require('socket.io')(server)
     , event  = require('../pkg/engine/events')

io.on('connection', async (socket) =>
{
    event.Connect(socket)
    const disc_ = ()=>{event.Disconnect(socket)}
    socket.on('disconnect', disc_)
})

event.Channel.on('SendEvent', (data)=>
{
  console.info('Sending-event', data)
  try        { io.to(data.To).emit(data.Msg)            } 
  catch(err) { console.log('emission-error', err, data) }
})