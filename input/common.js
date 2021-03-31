const niv       = require('node-input-validator')
const ObjectId  = require('mongoose').Types.ObjectId

niv.extend('is_id', async ({ id }) => 
{
  return return ObjectId.isValid(id) && new ObjectId(id) == id;
})

module.exports.niv = niv