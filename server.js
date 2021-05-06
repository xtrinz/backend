require("dotenv").config() // Read .env
require("./settings")

const express                           = require("express")
const app                               = express()
const { Auth, Forbidden, GracefulExit } = require("./common/mw");

// routes customer
const home = require("./routes/customer/home");
const cart = require("./routes/customer/cart");
const location = require("./routes/customer/location");
const login = require("./routes/customer/login");
const orderhistory = require("./routes/customer/orderhistory");
const payment = require("./routes/customer/payment");
const profile = require("./routes/customer/profile");
const search = require("./routes/customer/search");
const shopitem = require("./routes/customer/shopitem");
const register = require("./routes/customer/register");
// routes stripe payment gateway
const webhook = require("./routes/stripe/webhook");
// routes shop
const createshop = require("./routes/shop/createshop");
const crudshop = require("./routes/shop/crudshop");
const crudemployee = require("./routes/shop/crudemployee");
const shoporderhistory = require("./routes/shop/shoporderhistory");
const paymentstatement = require("./routes/shop/paymentstatement");

const
{
  returnError,
  handleUnCaughtException,
  handlePromiseRejection,
} = require("./error/errorhandlers")

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// jwt token verification not required for login and register
app.use("/register", register);
app.use("/login", login);
app.use("/webhook", webhook);

// Authenitcate
app.use(Auth);

app.use("/", home);
app.use("/cart", cart);
app.use("/location", location);
app.use("/orderhistory", orderhistory);
app.use("/payment", payment);
app.use("/profile", profile);
app.use("/search", search); // Todo : Incomplete. we need a proper algorithm (elastic search)
app.use("/shopitem", shopitem);

app.use("/sell", createshop);
app.use("/crudshop", crudshop);
app.use("/crudemployee", crudemployee);
app.use("/order", shoporderhistory);
app.use("/paymentstatement", paymentstatement);
app.use(Forbidden);

// error handling
app.use(returnError);

/*
// This will prevent dirty exit on code-fault crashes:
process.on("uncaughtException", handleUnCaughtException);
process.on("unhandledRejection", (err) => { console.log(err) }); // TODO Need proper handler
[`exit`, `SIGINT`, `SIGKILL`, `SIGTERM`].forEach((type) =>
{
  process.on(type, GracefulExit);
})
*/

const server = app.listen(3001, () =>
{
  console.log("Server Running On Port 3001");
})

const io    = require('socket.io')(server)
const event = require('./machine/events')
io.on('connection', async (socket) =>
{
    console.info('client-connected', socket.handshake.auth)
    event.Connect(socket.id, socket.handshake.auth)
    socket.on('disconnect', () =>
    {
        event.Disconnect(socket.id)
        console.info(`client-disconnected ${socket}`)
    })
})
event.Channel.on('SendEvent', (data)=>
{
  console.info('Sending-event', data)
	io.to(data.To).emit(data.Msg)
})