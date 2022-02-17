Configuration    :

    1. Set NODE_ENV variable as 'production' to avoid installation of dev dependencies
	   export NODE_ENV=production

Build essentials :

    1. npm clean
        Removes current node_modules/ & package-lock.json
    2. npm install
        Installs all packages listed in package.json
    3. npm start
        Runs the server
    4. npm test
        Executes the test cases


Paytm, Twilio, Google are blocked for testing

Directory Struct :

pkg/
├── infra
│   └── paytm
├── pipe
│   ├── fin
│   │   ├── address
│   │   ├── cart
│   │   ├── generic
│   │   ├── note
│   │   └── product
│   ├── role
│   │   ├── agent
│   │   ├── arbiter
│   │   ├── client
│   │   ├── seller
│   │   └── socket
│   └── run
│       ├── core
│       ├── journal
│       └── transit
├── sys
└── tool
    ├── filter
    ├── project
    ├── rinse
    └── rules
        ├── access
        └── input
