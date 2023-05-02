export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './mydb.sqlite',
    },
    useNullAsDefault: false,
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './mydb-prod.sqlite',
    },
    useNullAsDefault: false,
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: false,
  },
}
