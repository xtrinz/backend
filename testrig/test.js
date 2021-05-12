function TestRig(path, req, resp)
{
    this.Tests = []
    this.Failed= []
    this.EncodeReq   = function(data)
    {
        if (!data) { return }
    }
    this.EncodeResp  = function(data)
    {
        if (!data) { return }
    }

    this.EncodeEvent = function(data)
    {
        if (!data) { return }
    }

    this.Exec        = function(data)
    {

    }
    this.Run         = function()
    {
        this.Tests.forEach((test, index)=>
        {
            console.log(test.Describe)
            let data = 
            {
                  Type    : test.Type
                , Index   : index + 1
                , Path    : test.Path
                , Request : this.EncodeReq  (test.Request)
                , Response: this.EncodeResp (test.Response)
                , Event   : this.EncodeEvent(test.Event)
            }
            let res = this.Exec(data)
            if (res) 
            {
                console.log('> Passed')
            }
            else 
            { 
                console.log('> Failed')
                this.Failed.push({No: index+1, Title: test.Describe})
            }
        })

        console.log('Failed Test Cases: ')
        this.Failed.forEach((fail) =>
        {
            console.log(fail.No, fail.Title)
        })
        console.log('Test cases passed: ', this.Tests.length - this.Failed.length)
        console.log('Test cases failed: ', this.Failed.length)
        console.log('Total test cases : ', this.Tests.length)
    }
}

let test = 
{
      Type    : 'REST/EVENT'
    , Describe: 'Step 1'
    , Path    : '/the/path'
    , Request : 
    {
          Params        : { 'key': 'value' }
        , Body          : { 'key': 'value' }
        , Authorisation : 'Bearer xlfjsdlfj'
    }
    , Response:
    {
          Code : 200
        , Body : 
        {
              Status: 'Success'
            , Text  : 'User Found'
            , Data  : {}
        }
    }
    , Event  :
    {
        Subject: 'NewTransit'
    }

}