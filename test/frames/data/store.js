const { states } = require("../../../pkg/common/models")

let Store =
{
      Name         : 'StoreName'
    , Image        : 'image.store.com'
    , Type         : 'Electorics'
    , Certs        : ['a.cert', 'b.cert']
    , MobileNo     : '+91111111111'
    , Email        : 'store@store.com'
    , Longitude    : 17.2
    , Latitude 	   : 17.2
    , State        : states.Registered
    , Address      :
    {
          Line1       : 'Address.Line1'
        , Line2       : 'Address.Line2'
        , City        : 'Address.City'
        , PostalCode  : 123456
        , State       : 'Address.State'
        , Country     : 'Address.Country'
    }
}

module.exports =
{
    Store  : Store
}