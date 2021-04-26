/*
    1. Authenticate user
    2. Create sock_id-vs-user lookup
    3. Push sock_id to user record
    4. Push sock_id to transaction record if any
*/
const Connect = function(sock_id, auth)
{
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
const Disconnect = function()
{

}

module.exports =
{
    Connect     :   Connect,
    Disconnect  :   Disconnect
}