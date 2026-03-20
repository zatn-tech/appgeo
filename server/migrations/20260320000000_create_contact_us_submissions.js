exports.up = async function up(knex) {
  await knex.schema.createTable('contact_us_submissions', (table) => {
    table.increments('id').primary()
    table.string('name', 120).notNullable()
    table.string('phone', 50).nullable()
    table.text('need').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('contact_us_submissions')
}

