/*
 	https://stackoverflow.com/questions/23875233/require-returns-an-empty-object/23875299
	https://www.npmjs.com/package/madge

	To print circular dependencies
	------------------------------
*/


const madge = require('madge')

madge('./cmd/main.js').then((res) => 
{
    console.log(res.circularGraph())
})
