const env = process.env.NODE_ENV

const path = require('path')
const config = require('config')
const express = require('express')
const Mongorito = require('mongorito')
const Cache = require('mem-cache')
const favicon = require('serve-favicon')
const Job = require('cron').CronJob

const devLogger = require('./lib/middleware/dev-logger')
const ApiRoute = require('./routes/api')
const logger = require('./lib/logger')
const ingest = require('./lib/ingest')

const cache = new Cache()
const app = express()

app.use(favicon(path.join(__dirname, '/public/favicon.ico')))

if (env !== 'test') {
  app.use(devLogger())
}

const ingester = new Job('* * * * *', async () => {
  logger.info('Running Ingest')
  await ingest(cache)
})

app.get('/status', (req, res) => {
  res.send({status: 'ok'})
})

app.use('/api/v1', new ApiRoute(cache).router)

app.listen(config.port, async () => {
  await Mongorito.connect(config.mongodb)
  ingester.start()
  logger.info(`App listening at http://127.0.0.1:${config.port}`)
})

module.exports = app
