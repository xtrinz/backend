const Model        = require('../../../sys/models')
    , Transit      = 
{
      Agent        :
      {
          Fuel     : 2 
        , Effort   : 3
        , PSP      : 0.5 // just for calc
        , Total    : 5.5
      }
      , System     : 
      {
          Platform : 0.5
        , PSP      : 0.5 // just for calc
        , Total    : 1
      }
      , Total      : 6.5
}
    , Board =
{
	Category                  :
	{
		  [Model.category.Food] : 0.30
		, [Model.category.Eltx]	: 0.20
	},
  PSP                       : 0.02
}

const split = function(val, who, when)
{
    let res = 0
    switch(who)
    {

      case Model.mode.Agent   : 
      res = val * (Transit.Agent.Total  / Transit.Total)
      break

      case Model.mode.System  : 
      res = val * (Transit.System.Total / Transit.Total)
      break

    }
    return res.round()
}

const slab = function(val, who)
{
  let res = 0, tgt = 0

  if(val <= 10)
  {
    switch(who)
    {
      case Model.mode.Agent  : res += val.cut(.8); break
      case Model.mode.System : res += val.cut(.2); break
    }
  }
  else if(val <= 100)
  {
    switch(who)
    {
      case Model.mode.Agent  : 
      
      res += 8; tgt  = val - 10; 
      res += tgt.cut(.6); 
      break
      
      case Model.mode.System : 

      res += 2; tgt  = val - 10;
      res += tgt.cut(.4); 
      break

    }
  }
  else if(val <= 500)
  {
    switch(who)
    {
      case Model.mode.Agent  :
 
      res += 68; tgt  = val - 100
      res += tgt.cut(.5); 
      break

      case Model.mode.System : 

      res += 32; tgt  = val - 100
      res += tgt.cut(.5); 
      break

    }
  }
  else
  {
    switch(who)
    {
      case Model.mode.Agent  : res  = 300;      break
      case Model.mode.System : res  = val -300; break
    }
  }

  return res.round()
}

module.exports = { Transit, Board, split, slab }