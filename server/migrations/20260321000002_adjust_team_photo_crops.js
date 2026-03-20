exports.up = async function up(knex) {
  await knex('team_members')
    .where({ name: 'Krishnan Chellammal' })
    .update({ photo_position: '50% 18%' })

  await knex('team_members')
    .where({ name: 'R. Boominathan' })
    .update({ photo_position: '50% 24%' })
}

exports.down = async function down(knex) {
  await knex('team_members')
    .where({ name: 'Krishnan Chellammal' })
    .update({ photo_position: '50% 14%' })

  await knex('team_members')
    .where({ name: 'R. Boominathan' })
    .update({ photo_position: '50% 18%' })
}

