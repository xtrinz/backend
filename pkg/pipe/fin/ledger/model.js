const { ObjectId } = require('mongodb')
    , Model        = require('../../../sys/models')
    
class Ledger
{
    constructor(data)
    {
        this._id          = new ObjectId()
        this.Debit        = []
        this.Credit       = []
        this.Balance      =
        {
              Type        : Model.entry.Credit
            , Amount      : 0
        }
        this.Head         =
        {
              Mode        : data.Mode       // Mode - System, Seller, Agent, Client
            , ID          : data.ID         // Database Identifier (mongo id of respective entity, or sys tag)
            , Type        : data.Type       // Account - Asset, Liability, Income, Expense
            , Name        : data.Name       // Name of acc holder or name of system accounts
        }
    }
}

module.exports = Ledger