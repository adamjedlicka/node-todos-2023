import { db } from '../database.js'

export const getAllTodos = async ({ user = null, done = false } = {}) => {
  const query = db('todos')
    .select('*')
    .where('user_id', user?.id ?? null)

  if (done) {
    query.where('done', done)
  }

  const todos = await query

  return todos
}
