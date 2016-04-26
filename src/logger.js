/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const clc = require('cli-color');

const errorColor = clc.red.bold;
const infoColor = clc.blackBright;

exports.verbose = function verbose(message) {
    console.log(`${message}`);
};

exports.info = function info(message) {
    console.log(infoColor(`      ${message}`));
};

exports.error = function error(message) {
    console.log(errorColor(message));
};
