let Cart =
{
      Products        : 
    [{
        Name          : 'Product'
      , Image         : 'product.img.url'
      , Price         : 99
      , Quantity      : 3   
    }]
    , Bill            : 
    {                 
          Total       : 297
        , TransitCost : 0
        , Tax         : 0
        , NetPrice    : 297
    }
}

module.exports =
{
    Cart      : Cart
}