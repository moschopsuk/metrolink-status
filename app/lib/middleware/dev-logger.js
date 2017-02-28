const chalk = require('chalk')
const humanize = require('humanize-number')
const filesize = require('filesize')

module.exports = function () {
  const duration = start => {
    let delta = new Date() - start
    delta = delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
    return humanize(delta)
  }

  const statusToColor = status => {
    if (status >= 500) {
      return 'red'
    }

    if (status >= 400) {
      return 'yellow'
    }

    if (status >= 300) {
      return 'cyan'
    }

    if (status >= 200) {
      return 'green'
    }

    return 'reset'
  }

  const logger = (req, res, next) => {
    // request
    const start = new Date()
    console.log('  ' + chalk.gray('<——') +
      ' ' + chalk.bold('%s') +
      ' ' + chalk.gray('%s'),
      req.method,
      req.url)

    // response
    res.on('finish', () => {
      const len = Number(res.getHeader('content-length'))
      const statusColor = statusToColor(res.statusCode)
      const bytes = (len) ? filesize(len, {spacer: ''}) : ''

      console.log('  ' + chalk.gray('——>') +
        ' ' + chalk.bold('%s') +
        ' ' + chalk.gray('%s') +
        ' ' + chalk[statusColor]('%s') +
        ' ' + chalk.gray('%s') +
        ' ' + chalk.gray('%s'),
      req.method,
      req.url,
      res.statusCode,
      duration(start),
      bytes)
    })

    // error
    res.on('close', () => {
      console.log(`${chalk.gray('—X—')} ${chalk.red('connection closed before res end/flush')}`)
    })

    next()
  }

  return logger
}
