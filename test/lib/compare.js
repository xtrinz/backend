const isObject = (object) =>  {return (object != null && typeof object === 'object')}
const DeepEqual = function (obj, alt, skip) 
{
    if(!skip) skip = []
    const keys1    = Object.keys(obj)
    const keys2    = Object.keys(alt)  
    if (keys1.length !== keys2.length) 
    {
        console.log('#######XYZ', keys1, keys2) 
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
               console.log('#######', key, val1, val2) 
              return false 
        }
    }
    return true  
}

module.exports =
{
    DeepEqual: DeepEqual 
}