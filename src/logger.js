/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const chalk = require('chalk');

module.exports = {
    info: (msg) => {
        chalk.gray(msg);
    },

    error: (msg) => {
        chalk.red.bold(msg);
    },
};
