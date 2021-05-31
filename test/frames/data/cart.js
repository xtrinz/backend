let Cart =
{
      _id             : ''
    , UserID          : ''
    , Products        : ['', '']
    , Bill            : 
    {                 
          Total       : 0
        , TransitCost : 0
        , Tax         : 0
        , NetPrice    : 0
    }
}

let CartEntry =
{
      _id         : ''
    , ProductsID  : ''
    , StoreID     : ''
    , Quantity    : 3
}

module.exports =
{
    Cart      : Cart
  , CartEntry : CartEntry
}