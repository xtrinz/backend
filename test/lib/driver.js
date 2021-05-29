const compare        = require("./compare")
    , { Rest, Type } = require("./medium")

const prints = 
{
      Failed    : '      : Failed'
    , Passed    : '      : Passed'
    , ReadParam : '      : Read Test Params'
    , Head      : '{0} - {1}\n'
    , Step      : '   {0} : {1}'
    , FailedTC  : ' {0} - {1}\n\n    {2} : {3}'
}

function TestRig()
{
    this.Tests       = []
    this.Failed      = []
    this.AddTest     = (test) => this.Tests.push(test)
    this.Exec        = async function(data)
    {
        if (data.Type == Type.Rest)
        {
            let resp = await Rest(data.Request)
               , sts = await compare.DeepEqual(resp, data.Response)
            if(!sts)
            {
                console.log(prints.Failed) // console.log('\nRequest :', data.Request)
                console.log('\nExpected : ', data.Response, '\nReceived : ', resp)
                return false
            }
            console.log(prints.Passed)
            return true
        }
        else { return false }
    }
    this.Run         = async function()
    {
        for(let suite =0; suite < this.Tests.length; suite++)
        {
            let test = this.Tests[suite]
            console.log(prints.Head.format(('000' + (suite + 1)).substr(-2), test.Describe))
            for(let case_=0; case_ < test.Steps.length; case_++)
            {                        
                let step = test.Steps[case_]
                console.log(prints.Step.format(('000' + (case_ + 1)).substr(-2), step.Data.Describe))
                if(step.PreSet) { step.Data = await step.PreSet(step.Data) }
                step.Data.Index = suite + 1
                let res         = await this.Exec(step.Data)
                if (!res) this.Failed.push(
                    {
                        No      : suite + 1,
                        Title   : test.Describe,
                        StepNo  : step.Data.Index,
                        Step    : step.Data.Describe
                    })
            }
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

        console.log('\nPassed: ', this.Tests.length - this.Failed.length)
        console.log(  'Failed: ', this.Failed.length)
        console.log(  'Total : ', this.Tests.length)
    }
}

function TestCase(desc)
{
    this.Describe   = desc
    this.Steps      = []
    this.AddStep    = (test) => this.Steps.push(test)
}

var TestSuite  = new TestRig()

module.exports =
{
      Suite    : TestSuite
    , TestCase : TestCase
    , prints   : prints
}