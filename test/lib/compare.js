const isObject = (object) =>  {return (object != null && typeof object === 'object')}
const DeepEqual = function (obj, alt) 
{
    const keys1 = Object.keys(obj)
    const keys2 = Object.keys(alt)  
    if (keys1.length !== keys2.length) { return false }
    for (const key of keys1) 
    {
      const val1        = obj[key]
          , val2        = alt[key]
          , areObjects  = isObject(val1) && isObject(val2);
      if( areObjects && !DeepEqual(val1, val2) || 
          !areObjects && val1 !== val2 ) { return false }
    }
    return true  
}

module.exports =
{
    DeepEqual: DeepEqual 
}