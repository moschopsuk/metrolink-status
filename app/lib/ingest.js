const moment = require('moment')
const md5 = require('md5')
const logger = require('./logger')
const Incidents = require('./../model/incident')
const FetchTFGM = require('./fetchers/tfgm')

module.exports = async function (cache) {
  // fetch current tram issues
  const response = await FetchTFGM.fetch()
  const start = moment().startOf('day').toDate()
  const end = moment().endOf('day').toDate()

  if (response.serviceUnavailable) {
    logger.error('TFGM trams status service unavailable')
    return
  }

  const lines = response.items

  // store cache
  cache.set('tram_status', lines)

  // parse issues on lines
  lines.forEach(async line => {
    const hash = md5(line.detail + line.status + line.severity)

    if (line.name === 'Other lines' || line.name === 'All lines') {
      logger.info(`All lines ok`)
      return
    }

    let incident = await Incidents.where({hash: hash, created_at: {$gte: start, $lt: end}}).find()

    if (incident.length > 0) {
      logger.info(`Incident on line ${incident[0].get('name')} is already occuring`)
    } else {
      logger.info(`Creating new incident on ${line.name}`)
      incident = new Incidents({
        hash: hash,
        name: line.name,
        detail: line.detail,
        lineId: line.id,
        status: line.status,
        severity: line.severity
      })
      await incident.save()
    }
  })
}
