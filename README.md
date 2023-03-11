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


Caution: Paytm, Twilio, Google APIs are not enabled.

Directory Struct :

pkg/__
├── infra__
│   └── paytm__
├── pipe__
│   ├── fin__
│   │   ├── address__
│   │   ├── cart__
│   │   ├── generic__
│   │   ├── note__
│   │   └── product__
│   ├── role__
│   │   ├── agent__
│   │   ├── arbiter__
│   │   ├── client__
│   │   ├── seller__
│   │   └── socket__
│   └── run__
│       ├── core__
│       ├── journal__
│       └── transit__
├── sys__
└── tool__
    ├── filter__
    ├── project__
    ├── rinse__
    └── rules__
        ├── access__
        └── input__
