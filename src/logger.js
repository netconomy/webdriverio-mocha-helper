/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const chalk = require('chalk');

module.exports = {
    info: function info(msg) {
        console.log(chalk.gray(msg));
    },

    verbose: function verbose(msg) {
        console.log(chalk.magenta.bold(msg));
    },

    error: function error(msg) {
        console.log(chalk.red.bold(msg));
    }
};
