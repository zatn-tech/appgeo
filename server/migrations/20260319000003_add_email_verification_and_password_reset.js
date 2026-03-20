const PURPOSE_EMAIL_VERIFICATION = 'email_verification'
const PURPOSE_PASSWORD_RESET = 'password_reset'

exports.up = async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('email_verified_at').nullable()
  })

  await knex.schema.createTable('user_email_verification_otps', (table) => {
    table.increments('id').primary()
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table.string('purpose', 50).notNullable().defaultTo(PURPOSE_EMAIL_VERIFICATION)
    table.string('otp_hash', 64).notNullable() // sha256 hex length
    table.timestamp('expires_at').notNullable()
    table.timestamp('used_at').nullable()
    table.integer('attempts').notNullable().defaultTo(0)
    table.timestamps(true, true)

    table.index(['user_id', 'purpose'])
  })

  await knex.schema.createTable('user_password_reset_tokens', (table) => {
    table.increments('id').primary()
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('users.id')
      .onDelete('CASCADE')
    table.string('purpose', 50).notNullable().defaultTo(PURPOSE_PASSWORD_RESET)
    table.string('token_hash', 64).notNullable() // sha256 hex length
    table.timestamp('expires_at').notNullable()
    table.timestamp('used_at').nullable()
    table.timestamps(true, true)

    table.index(['user_id', 'purpose'])
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('user_password_reset_tokens')
  await knex.schema.dropTableIfExists('user_email_verification_otps')
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('email_verified_at')
  })
}

