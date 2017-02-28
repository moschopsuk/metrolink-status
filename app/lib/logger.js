const chalk = require('chalk')

module.exports.log = log => {
  console.info(chalk.bgWhite.black(' LOG '), log)
}

module.exports.info = log => {
  console.info(chalk.bgCyan.black(' INFO '), log)
}

module.exports.warn = log => {
  console.info(chalk.bgYellow.black(' WARN '), log)
}

module.exports.error = log => {
  console.info(chalk.bgRed.black(' ERR '), log)
}
