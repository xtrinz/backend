// Suite
// Caeses

function Test(path, req, resp)
{

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

}