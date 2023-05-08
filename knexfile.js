export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './mydb.sqlite',
    },
    useNullAsDefault: false,
  },
  production: {
    client: 'pg',
    connection: {
      host: 'db',
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: 'todos',
    },
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: false,
  },
}
