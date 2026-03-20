/**
 * Split legacy "Position (Education)" role strings into role (position) + education.
 */
exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('team_members', 'education')
  if (!hasColumn) {
    await knex.schema.alterTable('team_members', (table) => {
      table.text('education').nullable()
    })
  }

  const rows = await knex('team_members').select('id', 'role')
  for (const row of rows) {
    const r = String(row.role || '').trim()
    const match = r.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
    if (match) {
      await knex('team_members')
        .where({ id: row.id })
        .update({
          role: match[1].trim(),
          education: match[2].trim(),
        })
    }
  }
}

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('team_members', 'education')
  if (hasColumn) {
    await knex.schema.alterTable('team_members', (table) => {
      table.dropColumn('education')
    })
  }
}
