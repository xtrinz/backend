const
    io = require("socket.io-client"),
    url = "http://localhost:3001",   
    socket = io.connect(url, { autoConnect: false })

connect_user()
function connect_user()
{
    socket.auth =
    { 
        user_name: "user",
        user_id: "user_id",
        jwt: "user_jwt"
    }

    socket.connect()
}

function join()
{
    socket.emit('join', {'hello': 'hi'})
}

socket.onAny((event, ...args) =>
{
    console.log(event, args);
})