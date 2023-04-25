import express from 'express'
import { createUser, getUserByPassword } from '../database/users.js'

export const router = express.Router()

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', async (req, res) => {
  const user = await createUser(req.body.username, req.body.password)

  res.cookie('token', user.token)

  res.redirect('/')
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', async (req, res) => {
  const user = await getUserByPassword(req.body.username, req.body.password)

  res.cookie('token', user.token)

  res.redirect('/')
})

router.get('/logout', (req, res) => {
  res.cookie('token', '')

  res.redirect('/')
})
