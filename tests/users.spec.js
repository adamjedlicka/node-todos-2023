import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import { db, createUser, getUserByPassword, getUserByToken } from '../src/database.js'

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach.always(async () => {
  await db.migrate.rollback()
})

test.serial('createUser creates users', async (t) => {
  const user = await createUser('username', 'password')

  t.is(user.username, 'username')
  t.not(user.password, 'password')
})

test.serial('getUserByPassword gets user by password', async (t) => {
  const user = await createUser('username', 'password')

  t.deepEqual(await getUserByPassword('username', 'password'), user)
  t.notDeepEqual(await getUserByPassword('username', 'bad'), user)
  t.notDeepEqual(await getUserByPassword('bad', 'password'), user)
})

test.serial('getUserByToken gets user by password', async (t) => {
  const user = await createUser('username', 'password')

  t.deepEqual(await getUserByToken(user.token), user)
  t.notDeepEqual(await getUserByToken('bad'), user)
})

test.serial('GET /register it shows registration form', async (t) => {
  const response = await supertest(app).get('/register')

  t.assert(response.text.includes('Registrace'))
})

test.serial('POST /register after registration username is visible', async (t) => {
  const agent = supertest.agent(app)

  const response = await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)

  t.assert(response.text.includes('adam'))
})

test.serial('GET /login shows login form', async (t) => {
  const response = await supertest(app).get('/login')

  t.assert(response.text.includes('Přihlásit se'))
})

test.serial('POST /login logs-in a user', async (t) => {
  const agent = supertest.agent(app)

  await createUser('adam', 'heslo')

  const response = await agent.post('/login').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)

  t.assert(response.text.includes('adam'))
})

test.serial('GET /logout logouts a user', async (t) => {
  const agent = supertest.agent(app)

  const response1 = await agent
    .post('/register')
    .type('form')
    .send({ username: 'adam', password: 'heslo' })
    .redirects(1)

  t.assert(response1.text.includes('adam'))
  t.assert(!response1.text.includes('Registrovat se'))

  const response2 = await agent.get('/logout').redirects(1)

  t.assert(!response2.text.includes('adam'))
  t.assert(response2.text.includes('Registrovat se'))
})

test.serial('logged in user can see his todo', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)

  const response = await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)

  t.assert(response.text.includes('User todo'))
})

test.serial('anonymous user doesnt see todos of users', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)
  await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)

  const response = await agent.get('/logout').redirects(1)

  t.assert(!response.text.includes('User todo'))
})

test.serial('anonymous user doesnt see details of todos of other users', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)
  await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)

  const response1 = await agent.get('/detail-todo/1')
  t.assert(response1.text.includes('User todo'))

  await agent.get('/logout').redirects(1)

  const response2 = await agent.get('/detail-todo/1')
  t.assert(!response2.text.includes('User todo'))
})

test.serial('anonymous user cant update todos of other users', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)
  await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)
  await agent.get('/logout').redirects(1)

  const response = await agent.post('/update-todo/1')
  t.assert(response.text.includes('Stránka nenalezena'))
})

test.serial('anonymous user cant toggle todos of other users', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)
  await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)
  await agent.get('/logout').redirects(1)

  const response = await agent.get('/toggle-todo/1')
  t.assert(response.text.includes('Stránka nenalezena'))
})

test.serial('anonymous user cant remove todos of other users', async (t) => {
  const agent = supertest.agent(app)

  await agent.post('/register').type('form').send({ username: 'adam', password: 'heslo' }).redirects(1)
  await agent.post('/new-todo').type('form').send({ title: 'User todo' }).redirects(1)
  await agent.get('/logout').redirects(1)

  await agent.get('/remove-todo/1')
  const todos = await db('todos')
  t.is(todos.length, 1)
})
