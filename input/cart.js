const niv = require('./common')

const cart = function (req, res, next)
{
  const v = new niv.Validator(req.body,
  {
    shopinfoid: 'required|is_id:shopinfoid',
    productsid: 'required|is_id:productsid',
    quantity: 'required',
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
  Cart  : cart,
  
}