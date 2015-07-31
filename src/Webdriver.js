/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const WebdriverIO = require('webdriverio');
const Commands = require('./commands');

export default class Webdriver {
    constructor(options) {
        this.options = options;
        this.options.port = parseInt(options.port, 10);
        this.client = null;
    }

    setupClient() {
        this.client = WebdriverIO.remote(this.options);
        return this.client;
    }

    fullySetupClient() {
        if (this.client) {
            return Promise.resolve(this.client);
        }
        return this.setupClient().init().then(() => {
            Commands.registerCommands(this.client);
        });
    }

    tearDown() {
        return this.client.end().then(() => {
            this.client = null;
        });
    }

    getScreenshotDir() {
        return this.options.screenshotPath;
    }
}
