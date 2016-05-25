# webdriverio-mocha-helper
Helper library for a better webdriverio integration in mocha.
The main purpose of webdriverio-mocha-helper is to provide you with helper methods.

### Install
```
npm install webdriverio-mocha-helper --save
```
### Migration

The Helper class needs the parameter ``options`` on creation. The options have to be taken from the local environment file ``env``.
Create a JavaScript file (e.g. WebdriverHelper) in the common directory::

```javascript
import WebdriverHelper from 'webdriverio-mocha-helper';
const Env = require('./env');

const options = {
    desiredCapabilities: {
        browserName: Env.getBrowser(),
    },
    waitforTimeout: Env.getDefaultTimeout(),
    port: Env.getSeleniumPort(),
    host: Env.getSeleniumHost(),
    baseUrl: Env.getBaseUrl(),
    logLevel: 'silent',
    coloredLogs: true,
    screenshotPath: Env.getErrorScreenshotDir()
};

module.exports = (describe, it) => {
    const Webdriver = new WebdriverHelper(
        describe, it,
        options
    );
    return Webdriver;
};

```

### Library Content

* Helper.js
* Features.js
* commands.js
* Webdriver.js
* logger.js

### Helper's guiTest & runTest

Helpers.js is the place where ``guiTest`` and ``runTest`` functions are called. 
To use the helper functions from the package use this statement at the beginning of the tests/spec files::
```javascript
const Webdriver = require('../../common/WebdriverHelper')(describe, it);
```
Once imported and the const is declared you are ready use it in your tests.

withVersion Example test: 
```javascript
Webdriver.guiTest('Version check',
    function CheckoutTest() {
        Webdriver.guiTest('Version to high').withVersion('100.12.0', function VersionTest() {
            Webdriver.runTest('is not run because of version restriction', () => {
                return this.expect(true).to.equal.false;
            });
        });

        Webdriver.guiTest('Version passes').withVersion('4.12.0', function VersionTest() {
            Webdriver.runTest('is run because version restriction is fullfilled', () => {
                return this.client;
            });
        });
    });
```

Result:
 
  Version check
    Version to high
      - is not run because of version restriction
    Version passes
      V is run because version restriction is fulfilled

### Helper's pageAction

To abstract your test from specific markup selectors or specific commands 
you should always use page objects. A page object provides helpers for certain views 
and hold a composition of multiple WebdriverIO commands. 
The idea behind page objects is to keep your test simple and clear and to push reusability.

Example:
```javascript
import {pageAction} from 'webdriverio-mocha-helper';
const Logger = require('../node_modules/webdriverio-mocha-helper/lib/logger');
const idLoginForm = '#loginForm';

module.exports = class Registration {
    constructor(client) {
        this.client = client;
    }

    @pageAction
    login(loginData) {
        Logger.info('logging in');
        return this.waitForExist(idLoginForm)
            .fillForm(idLoginForm, loginData, true);
    }
);
```

### commands.js

As seen in the pageAction example the function ``fillForm`` is called.
This function is added as an webdriverio command within the command.js:
```javascript
function registerCommands(client) {
    client.addCommand('fillForm', function fillForm(formSelector, data, submit) {
    ...
```

There are several functions in the library which can be added in your tests. 

### Features.js

Features.js holds the ``testWrapperFactory`` which handles the ``withVersion`` and ``withFeatureEnabled`` methods.
``withVersion`` crosschecks the local environment files settings with the test file as seen in the withVersion example on top.
``withFeatureEnabled`` can block tests is the feature flag is set to false in the environment

Environment Example:
```javascript
    "settings": {
        "versionUrl": "http://t.xxxlutz.at.tlz.local.netconomy.net/back/versioninfo"
},
    "features": {
        "checkout": true
    },
    ...
```