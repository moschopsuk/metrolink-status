const {Router} = require('express')
const moment = require('moment')
const _ = require('lodash')
const config = require('config')
const Incidents = require('../model/incident')

class ApiRouter {

  constructor(cache) {
    this._cache = cache
    this.router = Router()
    this.router.get('/current', this.current.bind(this))
    this.router.get('/archive', this.archive.bind(this))
    this.router.get('/history', this.history.bind(this))
  }

  async current(req, res) {
    const tramLines = config.tramLines
    const status = this._cache.get('tram_status') || []

    const json = tramLines.map(line => {
      const issue = _.find(status, l => l.id === line.id)

      if (issue) {
        line = _.merge(line, issue)
      } else {
        line.status = 'Good Service'
      }

      return line
    })

    res.send(json)
  }

  async archive(req, res) {
    const start = moment().startOf('day').toDate()
    const end = moment().endOf('day').toDate()
    const activeIncidents = await Incidents.where({created_at: {$gte: start, $lt: end}}).find()

    res.send(activeIncidents)
  }

  async history(req, res) {
    const history = await Incidents.aggregate([
      {
        $group: {
          _id: {
            $add: [
              {$dayOfYear: '$created_at'},
              {$multiply:
                [400, {$year: '$created_at'}]
              }
            ]},
          count: {$sum: 1},
          first: {$min: '$created_at'}
        }
      },
      {$sort: {_id: -1}},
      {$limit: 365},
      {$project: {date: {$substr: ['$first', 0, 10]}, count: 1, _id: 0}}
    ])

    res.send(history)
  }
}

module.exports = ApiRouter
