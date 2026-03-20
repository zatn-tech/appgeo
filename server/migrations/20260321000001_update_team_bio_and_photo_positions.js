exports.up = async function up(knex) {
  await knex('team_members')
    .where({ name: 'Krishnan Chellammal' })
    .update({
      bio: 'A seasoned multidisciplinary professional, she leads the organization with strategic insight and technical expertise. Her leadership emphasizes sustainable development and the delivery of dependable, high-quality solutions across multiple domains.',
      photo_position: '50% 14%',
    })

  await knex('team_members')
    .where({ name: 'R. Boominathan' })
    .update({
      photo_position: '50% 18%',
    })
}

exports.down = async function down(knex) {
  await knex('team_members')
    .where({ name: 'Krishnan Chellammal' })
    .update({
      bio: 'Chellammal is a multidisciplinary professional with expertise in environmental studies, geosciences, and project management. As the Director of the company, she leads the organization in delivering environmental and geological consultancy services, including environmental clearance documentation, regulatory compliance, and project planning. Her leadership focuses on sustainable development and providing reliable technical solutions across multiple disciplines.',
      photo_position: '50% 20%',
    })

  await knex('team_members')
    .where({ name: 'R. Boominathan' })
    .update({
      photo_position: '50% 28%',
    })
}
