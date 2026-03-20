const path = require('path')

function mysqlConfigFromEnv() {
  const host = process.env.DB_HOST || '127.0.0.1'
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASS || ''
  const database = process.env.DB_NAME || ''

  return {
    client: 'mysql2',
    connection: { host, user, password, database },
    pool: { min: 0, max: 5 },
    migrations: { tableName: 'knex_migrations' },
  }
}

function sqliteConfig() {
  return {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'dev.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: { tableName: 'knex_migrations' },
  }
}

const shouldUseSqlite =
  (process.env.DB_CLIENT && process.env.DB_CLIENT.toLowerCase() === 'sqlite3') ||
  !process.env.DB_NAME

module.exports = {
  development: shouldUseSqlite ? sqliteConfig() : mysqlConfigFromEnv(),
  production: mysqlConfigFromEnv(),
}

