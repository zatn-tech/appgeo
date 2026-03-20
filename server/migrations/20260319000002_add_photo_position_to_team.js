exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('team_members', 'photo_position')
  if (!hasColumn) {
    await knex.schema.alterTable('team_members', (table) => {
      table.string('photo_position', 60).defaultTo('')
    })
  }
}

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('team_members', 'photo_position')
  if (hasColumn) {
    await knex.schema.alterTable('team_members', (table) => {
      table.dropColumn('photo_position')
    })
  }
}

