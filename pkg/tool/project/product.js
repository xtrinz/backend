const { verb } = require('../../sys/models')

module.exports =
{
    [verb.view]:
    {
        _id         : 1, SellerID    : 1,
        Name        : 1, Image      : 1,
        Price       : 1, Quantity   : 1,
        Description : 1, Category   : 1,
        IsAvailable : 1, VolumeBase : 1,
        Unit        : 1
    }
}