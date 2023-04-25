import express from 'express'
import { db } from '../database.js'
import { sendTodoDeletedToAllConnections, sendTodoToAllConnections, sendTodosToAllConnections } from '../websockets.js'

export const router = express.Router()

router.post('/new-todo', async (req, res) => {
  const newTodo = {
    title: (req.body.title || '').trim(),
    deadline: req.body.deadline || null,
    user_id: res.locals.user?.id ?? null,
  }

  if (!newTodo.title) {
    return res.status(400).render('400', {
      error: 'Zadejte název todočka!',
    })
  }

  await db('todos').insert(newTodo)

  sendTodosToAllConnections()

  res.redirect('/')
})

router.get('/remove-todo/:id', async (req, res) => {
  const idToRemove = Number(req.params.id)

  await db('todos')
    .delete()
    .where('id', idToRemove)
    .where('user_id', res.locals.user?.id ?? null)

  sendTodosToAllConnections()
  sendTodoDeletedToAllConnections(idToRemove)

  res.redirect('/')
})

router.get('/toggle-todo/:id', async (req, res, next) => {
  const idToToggle = Number(req.params.id)

  const todoToToggle = await db('todos')
    .select('*')
    .where('id', idToToggle)
    .where('user_id', res.locals.user?.id ?? null)
    .first()

  if (!todoToToggle) return next()

  await db('todos').update({ done: !todoToToggle.done }).where('id', idToToggle)

  sendTodosToAllConnections()
  sendTodoToAllConnections(idToToggle)

  res.redirect('back')
})

router.get('/detail-todo/:id', async (req, res, next) => {
  const idToShow = Number(req.params.id)

  const todoToShow = await db('todos')
    .select('*')
    .where('id', idToShow)
    .where('user_id', res.locals.user?.id ?? null)
    .first()

  if (!todoToShow) return next()

  res.render('detail', {
    todo: todoToShow,
  })
})

router.post('/update-todo/:id', async (req, res, next) => {
  const idToUpdate = Number(req.params.id)
  const newTitle = String(req.body.title)

  const todoToUpdate = await db('todos')
    .select('*')
    .where('id', idToUpdate)
    .where('user_id', res.locals.user?.id ?? null)
    .first()

  if (!todoToUpdate) return next()

  await db('todos').update({ title: newTitle }).where('id', idToUpdate)

  sendTodosToAllConnections()
  sendTodoToAllConnections(idToUpdate)

  res.redirect('back')
})
