const redis = require('redis')

const client = redis.createClient({
    host     : process.env.REDIS_HOST,
    port     : process.env.REDIS_PORT,
    password : process.env.REDIS_PASSWORD
})

// CONNECT
client.on('connect', function()
{
    console.log('Redis connected')
})

// GET
let data = await client.get(String('key') )
if(data) { console.log(data, 'cache hit') }
    else { console.log('cache miss')      }

// SET
client.setEx(String('key'), process.env.REDIS_EXPIRY, String('data'))

// ON ERROR
client.on('error', function(err) 
{
    console.log('Redis error: ' + err)
})

module.exports = client