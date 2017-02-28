const test = require('ava')
const request = require('supertest')
const app = require('../../app')

test('routes:/status', async t => {
  t.plan(3)
  const res = await request(app).get('/status')

  t.is(res.status, 200)
  t.is(res.body.status, 'ok')
  t.is(res.headers['content-type'], 'application/json; charset=utf-8')
})
