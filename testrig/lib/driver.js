const compare           = require("./compare")
const { Rest, Type }    = require("./medium")

function TestRig()
{
    this.Tests = []
    this.Failed= []
    this.EncodeReq   = function(data, path)
    {
        if (!data) { return }
        let req =
        {
              path      : path
            , method    : data.Method
            , headers   : data.Header
            , body      : data.Body
        }
        return req
    }

    this.EncodeEvent = function(data)
    {
        if (!data) { return }
    }

    this.Exec        = async function(data)
    {
        if (data.Type == Type.Rest)
        {
            let resp = await Rest(data.Request)
            let r = await compare.DeepEqual(resp, data.Response)
            if(!r)
            {
                console.log('  : Failed')
                console.log('Expected : ', data.Response, '\nReceived : ', resp)
                return false
            }
            console.log('  : Passed')
            return true
        }
        else if (data.Type == Type.Event)
        {

        }
        else
        {
            return false
        }
    }
    this.Run         = async function()
    {
        for(let index =0; index < this.Tests.length; index++)
        {
            let test  = this.Tests[index]
            console.log(index + 1, ':', test.Describe)
            let data = 
            {
                  Type    : test.Type
                , Index   : index + 1
                , Path    : test.Path
                , Response: test.Response
                , Request : this.EncodeReq  (test.Request, test.Path)
                , Event   : this.EncodeEvent(test.Event)
            }
            let res = await this.Exec(data)
            if (!res)
            {
                this.Failed.push({No: index+1, Title: test.Describe})
            }
        }

        if (this.Failed.length)
        {
            console.log('\nFailed Test Cases: ')
            this.Failed.forEach((fail) =>
            {
                console.log(' ', fail.No, ':', fail.Title)
            })
        }

        console.log('\nPassed: ', this.Tests.length - this.Failed.length)
        console.log('Failed: ', this.Failed.length)
        console.log('Total : ', this.Tests.length)
    }

    this.AddTest = function(test)
    {
        this.Tests.push(test)
    }
}

var TestSuite = new TestRig()

module.exports =
{
    Suite: TestSuite
}