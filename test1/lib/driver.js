const compare                = require("./compare")
    , { Rest, Type, Method } = require("./medium")
    , db                     = require("../../pkg/common/database")

const prints = 
{
      Failed    : '      : Failed'
    , Passed    : '      : Passed'
    , ReadParam : '      : Read Test Params'
    , Head      : '\n{0} - {1}\n'
    , Step      : '   {0} : {1}'
    , FailedTC  : `\n TestNo   : {0}\n Name     : {1}\n StepNo   : {2}\n StepName : {3}`
}

function TestRig()
{
    this.Tests       = []
    this.Failed      = []
    this.FailedCnt   = 0
    this.AddTest     = (test) => this.Tests.push(test)
    this.Exec        = async function(data)
    {
        if (data.Type == Type.Rest)
        {
            let resp = await Rest(data.Request)
               , sts = await compare.DeepEqual(resp, data.Response, data.Skip)
            if(!sts)
            {
                console.log(prints.Failed) // console.log('\nRequest :', data.Request)
                console.log('\nExpected : ', data.Response, '\nReceived : ', resp,)
                return {
                    Status: false
                    , Data: resp
                }
            }
            console.log(prints.Passed)
            return {
                Status: true
                , Data: resp
            }
        }
        else { return {
            Status: false
            , Data: {}
        } }
    }
    this.Run         = async function()
    {
        await db.database.dropDatabase()

        for(let suite =0; suite < this.Tests.length; suite++)
        {
            let test = this.Tests[suite], failed = false
            console.log(prints.Head.format(('000' + (suite + 1)).substr(-2), test.Describe))
            for(let case_=0; case_ < test.Steps.length; case_++)
            {                        
                let step    = test.Steps[case_]
                let data    = step.Data()
                console.log(prints.Step.format(('000' + (case_ + 1)).substr(-2), data.Describe))
                
                data.Index  = suite + 1
                let res     = await this.Exec(data)
                if(step.PostSet) { await step.PostSet(res.Data) }
                
                if (!res.Status)
                {
                     this.Failed.push(
                    {
                        No      : suite + 1,
                        Title   : test.Describe,
                        StepNo  : step.Data.Index,
                        Step    : step.Data.Describe
                    })
                    failed = true
                }
            }
            if(failed) this.FailedCnt++
        }

        if (this.Failed.length)
        {
            console.log('\nFailed Test Cases: ')
            this.Failed.forEach(
                (fail) => 
                console.log(prints.FailedTC.format(('00' + fail.No).substr(-2),
                            fail.Title, ('00' + fail.StepNo).substr(-2), fail.Step)
            ))
        }

        console.log('\nPassed: ', this.Tests.length - this.FailedCnt)
        console.log('Failed: '  , this.FailedCnt)
        console.log('Total : '  , this.Tests.length)

        await db.client.close()
    }
}

function TestCase(desc)
{
    this.Describe   = desc
    this.Steps      = []
    this.AddStep    = (test) => this.Steps.push(test)
}

var TestSuite  = new TestRig()

var read = async function ()
{
    console.log(prints.ReadParam)
    let req =
    {
        Method       : Method.GET
        , Path       : '/test'
        , Body       : {}
        , Header     : {}
    }
    let resp = await Rest(req)
    return resp
}

module.exports =
{
      Suite    : TestSuite
    , TestCase : TestCase
    , prints   : prints
    , read     : read
}