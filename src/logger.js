/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

const chalk = require('chalk');

module.exports = {
    info: (msg) => {
        console.log(chalk.gray(msg));
    },

    verbose: (msg) => {
        console.log(chalk.magenta.bold(msg));
    },

    error: (msg) => {
        console.log(chalk.red.bold(msg));
    },
};
