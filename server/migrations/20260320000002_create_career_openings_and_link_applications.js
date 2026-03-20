exports.up = async function up(knex) {
  await knex.schema.createTable('career_openings', (table) => {
    table.increments('id').primary()
    table.string('title', 160).notNullable()
    table.string('employment_type', 80).notNullable().defaultTo('Full-time')
    table.string('location', 160).nullable()
    table.text('summary').nullable()
    table.text('requirements').nullable()
    table.integer('sort_order').notNullable().defaultTo(0)
    table.boolean('is_published').notNullable().defaultTo(true)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })

  const hasOpeningId = await knex.schema.hasColumn('career_applications', 'opening_id')
  if (!hasOpeningId) {
    await knex.schema.alterTable('career_applications', (table) => {
      table.integer('opening_id').unsigned().nullable().references('career_openings.id').onDelete('SET NULL')
    })
  }
}

exports.down = async function down(knex) {
  const hasOpeningId = await knex.schema.hasColumn('career_applications', 'opening_id')
  if (hasOpeningId) {
    await knex.schema.alterTable('career_applications', (table) => {
      table.dropColumn('opening_id')
    })
  }
  await knex.schema.dropTableIfExists('career_openings')
}

