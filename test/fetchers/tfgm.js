const test = require('ava')
const td = require('testdouble')
const axios = require('axios')
const FetchTFGM = require('../../app/lib/fetchers/tfgm')

test.serial('performs http get', async () => {
  td.replace(axios, 'get')

  await FetchTFGM.fetch()

  td.verify(axios.get('http://test.com/api'))
  td.reset()
})

test.serial('parses json', async t => {
  const mockResponse = {
    retrievalDate: '17:12:30',
    items: []
  }

  td.replace(axios, 'get')
  td.when(axios.get('http://test.com/api')).thenReturn(Promise.resolve({data: mockResponse}))

  const status = await FetchTFGM.fetch()

  td.reset()
  t.deepEqual(mockResponse, status)
})
