const { verb } = require('../../system/models')

module.exports =
{
    [verb.view]:
    {
        _id         : 1, StoreID    : 1,
        Name        : 1, Image      : 1,
        Price       : 1, Quantity   : 1,
        Description : 1, Category   : 1,
        IsAvailable : 1, PricePerGV : 1,
        GroundVolume: 1, Unit       : 1
    }
}