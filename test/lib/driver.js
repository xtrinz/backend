const compare        = require("./compare")
    , { Rest, Type } = require("./medium")

function TestRig()
{
    this.Tests = []
    this.Failed= []
    this.AddTest = (test) => this.Tests.push(test)
    this.Exec        = async function(data)
    {
        if (data.Type == Type.Rest)
        {
            let resp = await Rest(data.Request)
               , sts = await compare.DeepEqual(resp, data.Response)
            if(!sts)
            {
                console.log('  : Failed') // console.log('\nRequest :', data.Request)
                console.log('\nExpected : ', data.Response, '\nReceived : ', resp)
                return false
            }
            console.log('  : Passed')
            return true
        }
        else { return false }
    }
    this.Run         = async function()
    {
        for(let index =0; index < this.Tests.length; index++)
        {
            let test               = this.Tests[index]
            console.log(index + 1, ':', test.Describe)
            if(test.PreSet) { test = await test.PreSet(test) }
                test['Index']      = index + 1
            let res                = await this.Exec(test)
            if (!res) this.Failed.push({No: test.Index, Title: test.Describe})
        }

        if (this.Failed.length)
        {
            console.log('\nFailed Test Cases: ')
            this.Failed.forEach((fail) => console.log(' ', fail.No, ':', fail.Title))
        }

        console.log('\nPassed: ', this.Tests.length - this.Failed.length)
        console.log(  'Failed: ', this.Failed.length)
        console.log(  'Total : ', this.Tests.length)
    }
}

var TestSuite = new TestRig()

module.exports =
{
    Suite: TestSuite
}