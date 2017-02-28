const test = require('ava')
const request = require('supertest')
const td = require('testdouble')
const express = require('express')
const devLogger = require('../../app/lib/middleware/dev-logger')

const app = express()
app.use(devLogger())

app.get('/200', (req, res) => res.status(200).send('hello world'))
app.get('/301', (req, res) => res.redirect(301, '/200'))
app.get('/304', (req, res) => res.redirect(304, '/200'))
app.get('/404', (req, res) => res.status(404).send('Not Found'))
app.get('/500', (req, res) => res.status(500).send('server error'))

test.serial('log a request', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/200')

  t.is(res.status, 200)
  td.verify(console.log(), {ignoreExtraArgs: true})
  td.reset()
})

test.serial('log a request with correct method and url', async t => {
  td.replace(console, 'log')

  const res = await request(app).head('/200')

  t.is(res.status, 200)
  td.verify(console.log('  <—— %s %s', 'HEAD', '/200'))
  td.reset()
})

test.serial('log a response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/200')

  t.is(res.status, 200)
  td.verify(console.log(), {ignoreExtraArgs: true, times: 2})
  td.reset()
})

test.serial('log a 200 response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/200')
  t.is(res.status, 200)
  td.verify(console.log('  ——> %s %s %s %s %s', 'GET', '/200', 200, td.matchers.anything(), '11B'))
  td.reset()
})

test.serial('log a 301 response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/301')
  t.is(res.status, 301)
  td.verify(console.log('  ——> %s %s %s %s %s', 'GET', '/301', 301, td.matchers.anything(), '38B'))
  td.reset()
})

test.serial('log a 304 response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/304')
  t.is(res.status, 304)
  td.verify(console.log('  ——> %s %s %s %s %s', 'GET', '/304', 304, td.matchers.anything(), '33B'))
  td.reset()
})

test.serial('log a 404 response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/404')
  t.is(res.status, 404)
  td.verify(console.log('  ——> %s %s %s %s %s', 'GET', '/404', 404, td.matchers.anything(), '9B'))
  td.reset()
})

test.serial('log a 500 response', async t => {
  td.replace(console, 'log')

  const res = await request(app).get('/500')
  t.is(res.status, 500)
  td.verify(console.log('  ——> %s %s %s %s %s', 'GET', '/500', 500, td.matchers.anything(), '12B'))
  td.reset()
})
