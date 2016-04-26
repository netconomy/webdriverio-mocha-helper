/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const WebdriverIO = require('webdriverio');
const commands = require('./commands');

class Webdriver {
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
            commands.registerCommands(this.client);
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

module.exports = Webdriver;
