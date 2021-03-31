const niv = require('./common')

const home = function (req, res, next)
{

  const v = new niv.Validator(req,
  {
    'header.x-access-token' : 'required',
    'params.pageno' : 'required|integer',
    'query.lattitude' : 'required',
    'query.longitude' : 'required'
  })

  v.check()
  .then((matched) => 
  {
    if (!matched)
    {
    	return res.status(422).send(v.errors)
    }
  })

}

module.exports =
{
  Home  : home
}