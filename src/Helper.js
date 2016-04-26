/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const Webdriver = require('./Webdriver');
const Features = require('./Features');
const Async = require('async');

class Helper {
    constructor(describe, it, options) {
        this.options = options;
        this.describe = describe;
        this.it = it;
        this.webdriver = new Webdriver(options);
        this.features = new Features(describe, it, this.webdriver);
    }

    guiTest(title) {
        let fn;
        let pageClasses;
        let newPageClasses = {};
        let argumentIndex = 1;
        const parentPageObjects = this.features.getPageObjects();
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
                withVersion: this.features.withVersion.bind(this.features, title, pageClasses, parentPageObjects, true),
                withFeatureEnabled: this.features.withFeatureEnabled.bind(this.features, title, pageClasses, parentPageObjects, true),
            };
        }
        return describe(title, this.features.testWrapperFactory(pageClasses, parentPageObjects, fn).bind(this.features));
    }

    runTest(title, fn) {
        return it(title, function itWrapper() {
            return fn.apply(this, arguments).catch((e) => {
                throw e; // Webdriver has a bug where it sometimes ignores one promise handler on rejected promises.
            });
        });
    }

    runSeries(promiseFunctions) {
        return new Promise((resolve, reject) => {
            const wrappedFunctions = promiseFunctions.map((fn) => {
                return function promiseWrapper(cb) {
                    fn().then(cb.bind(null, null), cb);
                };
            });
            Async.series(wrappedFunctions, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    };

    pageAction(target, name, descriptor) {
        const originalFn = descriptor.value;
        descriptor.value = function pageActionWrapper() {
            const args = arguments;
            return () => {
                return originalFn.apply(this.client, args).catch((e) => {
                    throw e; // Webdriver has a bug where it sometimes ignores one promise handler on rejected promises.
                });
            };
        };
    };

}

module.exports = Helper;