exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('gallery_images', 'is_home_slide')
  if (!hasColumn) {
    await knex.schema.alterTable('gallery_images', (table) => {
      table.boolean('is_home_slide').notNullable().defaultTo(false)
    })
  }
}

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('gallery_images', 'is_home_slide')
  if (hasColumn) {
    await knex.schema.alterTable('gallery_images', (table) => {
      table.dropColumn('is_home_slide')
    })
  }
}

