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
    const webdriverIOMock = sinon.mock();

    before(() => {
        rewiredWebdriver = Webdriver.__set__({
            remote: webdriverIOMock,
        });
    });

    after(() => {
        rewiredWebdriver();
    });

    beforeEach(() => {
        webdriverIOMock.reset();
    });

    it('returns winston logger', () => {

    });
});
