exports.up = async function up(knex) {
  await knex.schema.createTable('career_applications', (table) => {
    table.increments('id').primary()
    table.string('full_name', 160).notNullable()
    table.string('email', 255).notNullable()
    table.string('phone', 50).nullable()

    table.string('applied_role', 160).nullable()
    table.text('education').nullable()
    table.text('experience').nullable()
    table.text('location').nullable()
    table.text('message').nullable()
    table.string('resume_url', 512).nullable()

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('career_applications')
}

