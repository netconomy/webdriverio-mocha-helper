/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const Logger = require('./logger');

Chai.use(ChaiAsPromised);
ChaiAsPromised.transferPromiseness = (assertion, promise) => {
    assertion.then = promise.then.bind(promise);
    assertion.catch = promise.catch.bind(promise);
};

export default class Features {
    constructor(describe, it, webdriver) {
        this.describe = describe;
        this.it = it;
        this.webdriver = webdriver;
        this.pageObjects = {};
    }

    withVersion(title) {
        let fn;
        let pageClasses;
        let newPageClasses = {};
        let argumentIndex = 1;
        const parentPageObjects = this.pageObjects;
        if (typeof (arguments[argumentIndex]) === 'object') {
            newPageClasses = arguments[argumentIndex];
            argumentIndex++;
        }
        if (typeof (arguments[argumentIndex]) === 'function') {
            fn = arguments[argumentIndex];
        }
        pageClasses = Object.assign({}, newPageClasses, parentPageObjects || {});

        if (!fn) {
            return {
                withVersion: this.withVersion.bind(null, title, pageClasses, parentPageObjects, true),
                withFeatureEnabled: this.withFeatureEnabled.bind(null, title, pageClasses, parentPageObjects, true),
            };
        }
        return describe(title, this.testWrapperFactory(pageClasses, parentPageObjects, fn));
    }

    withFeatureEnabled(title, fn) {
        return it(title, function itWrapper() {
            return fn.apply(this, arguments).catch((e) => {
                throw e; // Webdriver has a bug where it sometimes ignores one promise handler on rejected promises.
            });
        });
    }

    testWrapperFactory(pageClasses, parentPageObjects, fn) {
        return function testWrapper() {
            const scope = {
                client: null,
                expect: Chai.expect,
                ...pageClasses,
            };
            this.pageObjects = pageClasses;

            beforeEach((done) => {
                function createPageObjectsFromClient(scopeObject, classes) {
                    const classKeys = Object.keys(classes);
                    classKeys.forEach((key) => {
                        scopeObject[key] = new classes[key](scopeObject.client);
                    });
                }
                if (!this.webdriver.client) {
                    return this.webdriver.fullySetupClient().then(() => {
                        scope.client = this.webdriver.client;
                        createPageObjectsFromClient(scope, pageClasses);
                        done();
                    });
                }
                scope.client = this.webdriver.client;
                createPageObjectsFromClient(scope, pageClasses);
                done();
            });

            afterEach((done) => {
                if (this.webdriver.client) {
                    if (this && this.currentTest && this.currentTest.state === 'failed') {
                        const screenshotDir = this.webdriver.getScreenshotDir();
                        const fileName = `${screenshotDir}/${this.currentTest.title}.png`;
                        return scope.client.saveScreenshot(fileName).then(() => {
                            Logger.error(`Test failed. Saved last state as screenshot to "${fileName}"`);
                            return this.webdriver.tearDown().then(done, done);
                        }, done);
                    }
                    return this.webdriver.tearDown().then(done, done);
                }
                done();
            });

            after(() => {
                this.pageObjects = parentPageObjects;
            });

            fn.apply(scope);
        };
    }

    getPageObjects() {
        return this.pageObjects;
    }
}
