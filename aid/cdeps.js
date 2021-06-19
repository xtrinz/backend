// Print circular dependencies
const madge = require('madge')

madge('./cmd/main.js').then((res) => 
{
    console.log(res.circularGraph())
})