/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const Webdriver = require('./Webdriver');
const Features = require('./Features');

class Helper {
    constructor(describe, it, options) {
        this.options = options;
        this.describe = describe;
        this.it = it;
        this.webdriver = new Webdriver(options.webdriver);
        this.features = new Features(describe, it, options.features, this.webdriver);
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
                withVersion: this.features.withVersion.bind(null, title, pageClasses, parentPageObjects, true),
                withFeatureEnabled: this.features.withFeatureEnabled.bind(null, title, pageClasses, parentPageObjects, true),
            };
        }
        return describe(title, this.features.testWrapperFactory(pageClasses, parentPageObjects, fn));
    }

    runTest(title, fn) {
        return it(title, function itWrapper() {
            return fn.apply(this, arguments).catch((e) => {
                throw e; // Webdriver has a bug where it sometimes ignores one promise handler on rejected promises.
            });
        });
    }
}

module.exports = Helper;