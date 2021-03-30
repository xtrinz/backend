const { Validator } = require('node-input-validator');

const cart = function (shopinfoid, productsid, quantity)
{
  const v = new Validator(req.body,
  {
    shopinfoid: 'required',
    productsid: 'required',
    quantity: 'required',
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
    	return res.status(422).send(v.errors)
    }
  })
  next()
}
