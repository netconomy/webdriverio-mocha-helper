/**
 * @author <a href="mailto:stefanmayer13@gmail.com">Stefan Mayer</a>
 */
'use strict';

const rewire = require('rewire');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;

const Webdriver = rewire('../src/Webdriver');

describe('Webdriver', () => {
    let rewiredWebdriver;
    const webdriverIOStub = sinon.stub(Webdriver.__get__('WebdriverIO'));
    const commandsStub = sinon.stub(Webdriver.__get__('commands'));

    before(() => {
        rewiredWebdriver = Webdriver.__set__({
            WebdriverIO: webdriverIOStub,
            commands: commandsStub,
        });
    });

    after(() => {
        rewiredWebdriver();
    });

    describe('setupClient', () => {
        beforeEach(() => {
            webdriverIOStub.remote.reset();
        });

        it('calls remote on webdriver', () => {
            const webdriver = new Webdriver({});

            webdriver.setupClient();

            expect(webdriverIOStub.remote.callCount).to.be.equal(1);
        });

        it('uses port and host provided', () => {
            const options = {
                host: 'testhost',
                port: '1234',
            };
            const webdriver = new Webdriver(options);

            webdriver.setupClient();

            expect(webdriverIOStub.remote.getCall(0).args[0]).to.be.deep.equal({
                host: options.host,
                port: parseInt(options.port, 10),
            });
        });

        it('returns a new webdriver client', () => {
            const client = {};
            webdriverIOStub.remote.returns(client);
            const webdriver = new Webdriver({});

            const webdriverClient = webdriver.setupClient();

            expect(webdriverClient).to.be.equal(client);
        });
    });

    describe('fullySetupClient', () => {
        beforeEach(() => {
            commandsStub.registerCommands.reset();
        });

        it('should init the client', () => {
            const client = {
                init: sinon.stub(),
            };
            client.init.returns({
                then: () => {},
            });
            webdriverIOStub.remote.returns(client);
            const webdriver = new Webdriver({});

            webdriver.fullySetupClient();

            expect(client.init.callCount).to.be.equal(1);
        });

        it('should registerCommands on the client', () => {
            const client = {
                init: sinon.stub(),
            };
            client.init.returns(Promise.resolve());
            webdriverIOStub.remote.returns(client);
            const webdriver = new Webdriver({});

            return webdriver.fullySetupClient()
                .then(() => {
                    expect(commandsStub.registerCommands.callCount).to.be.equal(1);
                    expect(commandsStub.registerCommands.getCall(0).args[0]).to.be.equal(client);
                });
        });

        it('should not registerCommands if init fails', () => {
            const client = {
                init: sinon.stub(),
            };
            client.init.returns(Promise.reject());
            webdriverIOStub.remote.returns(client);
            const webdriver = new Webdriver({});

            return webdriver.fullySetupClient()
                .then(() => {
                    expect(false).to.be.true;
                }, () => {
                    expect(commandsStub.registerCommands.callCount).to.be.equal(0);
                });
        });

        it('should not registerCommands if client already set', () => {
            const client = {
                init: sinon.stub(),
            };
            client.init.returns(Promise.resolve());
            webdriverIOStub.remote.returns(client);
            const webdriver = new Webdriver({});

            return webdriver.fullySetupClient()
                .then(() => {
                    return webdriver.fullySetupClient();
                })
                .then(() => {
                    expect(commandsStub.registerCommands.callCount).to.be.equal(1);
                });
        });
    });
});
