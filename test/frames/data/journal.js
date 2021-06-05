let Journal =
{
    Longitude         : 17.2
  , Latitude          : 17.2
  , Address           :
  {
      Name            : 'Address.Name'
    , Line1           : 'Address.Line1'
    , Line2           : 'Address.Line2'
    , City            : 'Address.City'
    , PostalCode      : 123456
    , State           : 'Address.State'
    , Country         : 'Address.Country'
  }
  , Products          :
    [{
        Name          : 'Product'
      , Image         : 'product.img.url'
      , Price         : 99
      , Quantity      : 3
    }]
  , Bill              : 
    {
        Total         : 297
      , TransitCost   : 0
      , Tax           : 0
      , NetPrice      : 297
    }
}

module.exports =
{
    Journal: Journal
}