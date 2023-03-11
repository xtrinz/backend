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
│___└── paytm</br>
├── pipe</br>
│___├── fin</br>
│___│___├── address</br>
│___│___├── cart</br>
│___│___├── generic</br>
│___│___├── note</br>
│___│___└── product</br>
│___├── role</br>
│___│___├── agent</br>
│___│___├── arbiter</br>
│___│___├── client</br>
│___│___├── seller</br>
│___│___└── socket</br>
│___└── run</br>
│___    ├── core</br>
│___    ├── journal</br>
│___    └── transit</br>
├── sys</br>
└── tool</br>
    ├── filter</br>
    ├── project</br>
    ├── rinse</br>
    └── rules</br>
        ├── access</br>
        └── input</br>
