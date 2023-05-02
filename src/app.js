import express from 'express'
import cookieParser from 'cookie-parser'
import { router as todosRouter } from './routes/todos.js'
import { router as usersRouter } from './routes/users.js'
import loadUser from './middlewares/loadUser.js'
import { getAllTodos } from './database/todos.js'

export const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(loadUser)

app.get('/', async (req, res, next) => {
  try {
    const todos = await getAllTodos({
      user: res.locals.user,
      done: req.query.done === 'true',
    })

    return res.render('index', {
      todos: todos,
    })
  } catch (e) {
    next(e)
  }
})

app.use(todosRouter)
app.use(usersRouter)

app.use((req, res) => {
  res.status(404).render('404')
})
