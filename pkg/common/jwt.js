const jwt        = require('jsonwebtoken')
    , jwt_secret = process.env.JWT_AUTHORIZATION_TOKEN_SECRET

    , Sign       = async function(data)
    {
        const token = await jwt.sign(data, jwt_secret)
        return token
    }
    , Verify     = async function(data)
    {
        const res = await jwt.verify(data, jwt_secret)
        return res
    }

module.exports = 
{
      Sign   : Sign
    , Verify : Verify
}