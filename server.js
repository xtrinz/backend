require("./settings")

const   express = require("express")
      , app     = express()
      , port    = process.env.PORT
      , adptr   = require("./common/adapter")
      , { text }= require('./common/error')

      , user    = require('./routes/user'   )
      , store   = require('./routes/store'  )
      , product = require('./routes/product')
      , cart    = require('./routes/cart'   )
      , address = require('./routes/address')
      , journal = require('./routes/journal')
      , transit = require('./routes/transit')
      , common  = require('./routes/common' )           
  
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
[ `uncaughtException`,
  `exit`, `SIGINT`,
  `SIGKILL`, `SIGTERM`].forEach((type) =>
{
  process.on(type, adptr.GracefulExit);
})

const server_ = () => { console.log(text.Server.format(port)) }
     , server = app.listen(port, server_)

     , io     = require('socket.io')(server)
     , event  = require('./machine/events')

io.on('connection', async (socket) =>
{
    event.Connect(socket)
    const disc_ = ()=>{event.Disconnect(socket)}
    socket.on('disconnect', disc_)
})

event.Channel.on('SendEvent', (data)=>
{
  console.info('Sending-event', data)
	io.to(data.To).emit(data.Msg)
})