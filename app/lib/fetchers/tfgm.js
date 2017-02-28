const axios = require('axios')
const config = require('config')
const logger = require('../logger')

class FetchTFGM {
  static async fetch() {
    let parsedResponse

    try {
      parsedResponse = (await axios.get(config.api.tfgm)).data
    } catch (err) {
      logger.error(`Failed to fetch JSON:(${err})`)
      parsedResponse = {}
    }

    return parsedResponse
  }

  constructor(tramStatus) {
    this.rawTramStatus = tramStatus
  }
}

module.exports = FetchTFGM
