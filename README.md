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

pkg/</br>
├── infra</br>
│   └── paytm</br>
├── pipe</br>
│   ├── fin</br>
│   │   ├── address</br>
│   │   ├── cart</br>
│   │   ├── generic</br>
│   │   ├── note</br>
│   │   └── product</br>
│   ├── role</br>
│   │   ├── agent</br>
│   │   ├── arbiter</br>
│   │   ├── client</br>
│   │   ├── seller</br>
│   │   └── socket</br>
│   └── run</br>
│       ├── core</br>
│       ├── journal</br>
│       └── transit</br>
├── sys</br>
└── tool</br>
    ├── filter</br>
    ├── project</br>
    ├── rinse</br>
    └── rules</br>
        ├── access</br>
        └── input</br>
