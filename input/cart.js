const niv = require('./common')

const cart_get = function (req, res, next)
{
  const v = new niv.Validator(req.header,
  {
    x-access-token: 'required|string'
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
    	return res.status(422).send(v.errors)
    }
    next()
  })
}


const cart_post = function (req, res, next)
{
  const v = new niv.Validator(req,
  {
    'header.x-access-token': 'required|string',
    'body.shopinfoid': 'required|is_id:shopinfoid'
    .....................complete..............
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
      return res.status(422).send(v.errors)
    }
    next()
  })
}

const cart_del = function (req, res, next)
{
  const v = new niv.Validator(req,
  {

  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
      return res.status(422).send(v.errors)
    }
    next()
  })
}

module.exports =
{
  CartGet  : cart_get,
  CartPost : cart_post,
  CartDel  : cart_del
}