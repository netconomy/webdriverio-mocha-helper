/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');
const Semver = require('semver');
const Logger = require('./logger');
const Env = require('../../../common/env');

Chai.use(ChaiAsPromised);
ChaiAsPromised.transferPromiseness = (assertion, promise) => {
    assertion.then = promise.then.bind(promise);
    assertion.catch = promise.catch.bind(promise);
};

class Features {
    constructor(describe, it, webdriver) {
        this.describe = describe;
        this.it = it;
        this.webdriver = webdriver;
        this.pageObjects = {};
    }

    withVersion(title, pageClasses, parentPageObjects, enabled, version, fn) {
        const backendVersion = Env.getVersion();
        if (enabled && Semver.satisfies(backendVersion, `>=${version}`)) {
            if (fn) {
                return describe(title, this.testWrapperFactory(pageClasses, parentPageObjects, fn).bind(this));
            }
            return {
                withFeatureEnabled: this.withFeatureEnabled.bind(this, title, pageClasses, parentPageObjects, true),
            };
        }
        if (fn) {
            return xdescribe(title, this.testWrapperFactory(pageClasses, parentPageObjects, fn));
        }
        return {
            withFeatureEnabled: this.withFeatureEnabled.bind(this, title, pageClasses, parentPageObjects, false),
        };
    }

    withFeatureEnabled(title, pageClasses, parentPageObjects, enabled, featureFlag, fn) {
        if (enabled && Env.supportsFeature(featureFlag)) {
            Logger.verbose(`Feature '${featureFlag}' is supported`);
            if (fn) {
                return describe(title, this.testWrapperFactory(pageClasses, parentPageObjects, fn).bind(this));
            }
            return {
                withVersion: this.withVersion.bind(this, title, pageClasses, parentPageObjects, true),
            };
        }
        if (enabled) {
            Logger.verbose(`Feature '${featureFlag}' is not supported`);
        }
        if (fn) {
            return xdescribe(title, this.testWrapperFactory(pageClasses, parentPageObjects, fn).bind(this));
        }
        return {
            withVersion: this.withVersion.bind(this, title, pageClasses, parentPageObjects, false),
        };
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

module.exports = Features;
