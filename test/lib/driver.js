const compare                = require("./compare")
    , { Rest, Socket, Type, Method } = require("./medium")
    , db                     = require("../../pkg/common/database")

const prints = 
{
      Failed    : '      : Failed'
    , Passed    : '      : Passed'
    , ReadParam : '      : Read Test Params'
    , Head1     : '\n{0} - {1}'
    , Head      :  '\n   - {1}({0})\n'
    , Step      : '   {0} : {1}'
    , FailedTC  : `\n SuiteNo  : {0}\n Suite    : {1}\n CaseNo   : {2}\n Case     : {3}\n StepNo   : {4}\n Step     : {5}`
}

function TestRig()
{
    this.TestSuites   = []
    this.Failed       = []
    this.FailedCnt    = 0
    this.AddTestSuite = (suite_) => this.TestSuites.push(suite_)
    this.Exec         = async function(data)
    {
        switch(data.Type)
        {
            case Type.Rest:
                let resp = await Rest(data.Request)
                , sts = await compare.DeepEqual(resp, data.Response, data.Skip)
                if(sts) { return { Status: true, Data: resp } }
                console.log(prints.Failed, '\n\nExpected : ', data.Response, '\nReceived : ', resp)
                return { Status: false, Data: resp }
            case Type.Event:
                switch(data.Method)
                {
                    case Method.CONNECT    :
                        let res = await Socket.Connect(data.Authorization)
                        return { Status: true,  Data: res   }
                    case Method.EVENT      :
                        let resp = await Socket.Read(data.Socket)
                        let sts  = await compare.DeepEqual(resp, data.Event, data.Skip)
                        if(sts)
                        return { Status: true,  Data: resp  }
                        console.log(prints.Failed, '\n\nExpected : ', data.Event, '\nReceived : ', resp)
                        return { Status: false, Data: resp  }
                    case Method.DISCONNECT :
                        await Socket.Disconnect(data.Socket)
                        return { Status: true,  Data: {}    }
                }
        }
    }
    this.Run         = async function()
    {
        for(let suite_ =0; suite_ < this.TestSuites.length; suite_++)
        {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            db.database.dropDatabase()
            await new Promise((resolve) => setTimeout(resolve, 5000));
            
            let suite = this.TestSuites[suite_], failed = false
            let net_step_cnt = 0
            console.log(prints.Head1.format(('000' + (suite_ + 1)).substr(-2), suite.Describe))
            for(let case_ =0; case_ < suite.Cases.length; case_++)
            {
                let test_case = suite.Cases[case_]
                console.log(prints.Head.format(('000' + (case_ + 1)).substr(-2), test_case.Describe))            
                for(let step_=0; step_ < test_case.Steps.length; step_++)
                {                        
                    let step      = test_case.Steps[step_]
                    let step_data = step.Data()
                    console.log(prints.Step.format(('000' + (net_step_cnt + 1)).substr(-2), step_data.Describe))
                    let res  = await this.Exec(step_data)
                    if (step.PostSet) { await step.PostSet(res.Data) }
                    net_step_cnt++
                    if (!res.Status)
                    {
                        this.Failed.push({ SuiteNo : suite_ + 1, Suite :     suite.Describe 
                                        ,  CaseNo  : case_ +  1, Case  : test_case.Describe
                                        ,  StepNo  : net_step_cnt, Step  : step_data.Describe })
                        failed = true
                    }
                }
            }
            if(failed) this.FailedCnt++
        }
        if (this.Failed.length)
        {
            console.log('\nFailed Test Cases: ')
            this.Failed.forEach( (fail) => {
            console.log(
                prints.FailedTC.format(
                    ('00' + fail.SuiteNo).substr(-2), fail.Suite,
                    ('00' + fail.CaseNo).substr(-2) , fail.Case ,
                    ('00' + fail.StepNo).substr(-2) , fail.Step ))})
        }
        console.log('\nFailed: ', this.FailedCnt   )
        console.log('Total : '  , this.TestSuites.length)

        await db.client.close()
    }
}

function TestCase(desc)
{
    this.Describe   = desc
    this.Steps      = []
    this.AddStep    = (test) => this.Steps.push(test)
}

function TestSuite(desc)
{
    this.Describe  = desc
    this.Cases     = []
    this.AddCase   = (test) => this.Cases.push(test)
}

var Test  = new TestRig()

var read = async function ()
{
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
      Test      : Test
    , TestCase  : TestCase
    , TestSuite : TestSuite
    , prints    : prints
    , read      : read
}