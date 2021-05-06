const isObjectEmpty = function (obj)
{
  return typeof obj != "object" || Object.keys(obj).length === 0
}

const isArrayEmpty = function (arr)
{
  return !Array.isArray(arr) || arr.length == 0
}

module.exports = 
{
  isObjectEmpty,
  isArrayEmpty
}