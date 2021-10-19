const isObject = (object) =>  {return (object != null && typeof object === 'object')}
const DeepEqual = function (obj, alt, skip) 
{
    if(!skip) skip = []
    const keys1    = Object.keys(obj)
    const keys2    = Object.keys(alt)  
    if (keys1.length !== keys2.length) 
    {
        console.log('#######XYZ', JSON.stringify(keys1), '\n', JSON.stringify(keys2), '\n') 
        return false
    }
    for (const key of keys1) 
    {
      if(skip.includes(key)) continue
      const val1        = obj[key]
          , val2        = alt[key]
          , areObjects  = isObject(val1) && isObject(val2);
      if( areObjects && !DeepEqual(val1, val2, skip) || 
          !areObjects && val1 !== val2 ) 
        {
               console.log('#######', JSON.stringify(key), '\n', JSON.stringify(val1),'\n', JSON.stringify(val2), '\n') 
              return false 
        }
    }
    return true  
}

module.exports =
{
    DeepEqual: DeepEqual 
}