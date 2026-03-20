exports.up = async function up(knex) {
  // RBAC + audit
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary()
    table.string('name', 50).notNullable().unique()
    table.timestamps(true, true)
  })

  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary()
    table.string('key', 100).notNullable().unique()
    table.string('description', 255)
    table.timestamps(true, true)
  })

  await knex.schema.createTable('role_permissions', (table) => {
    table.integer('role_id').unsigned().notNullable()
    table.integer('permission_id').unsigned().notNullable()
    table.primary(['role_id', 'permission_id'])
    table
      .foreign('role_id')
      .references('roles.id')
      .onDelete('CASCADE')
    table
      .foreign('permission_id')
      .references('permissions.id')
      .onDelete('CASCADE')
  })

  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('email', 255).notNullable().unique()
    table.string('password_hash', 255).notNullable()
    table
      .integer('role_id')
      .unsigned()
      .notNullable()
      .references('roles.id')
      .onDelete('RESTRICT')
    table.boolean('is_active').notNullable().defaultTo(true)
    table.timestamp('last_login_at').nullable()
    table.timestamps(true, true)
  })

  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary()
    table
      .integer('actor_user_id')
      .unsigned()
      .nullable()
      .references('users.id')
      .onDelete('SET NULL')
    table.string('action', 120).notNullable()
    table.string('resource_type', 80)
    table.string('resource_id', 120)
    table.string('ip_address', 64)
    table.text('user_agent')
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
  })

  // Content: minimal tables required for the site/admin flows
  await knex.schema.createTable('site_settings', (table) => {
    table.string('key', 120).primary()
    table.text('value').notNullable()
    table.timestamps(true, true)
  })

  await knex.schema.createTable('team_members', (table) => {
    table.increments('id').primary()
    table.string('name', 120).notNullable()
    table.string('role', 120).defaultTo('')
    table.text('bio')
    table.string('photo_url', 255).defaultTo('')
    table.integer('sort_order').notNullable().defaultTo(0)
    table.boolean('is_published').notNullable().defaultTo(true)
    table.timestamps(true, true)
  })

  await knex.schema.createTable('gallery_sections', (table) => {
    table.increments('id').primary()
    table.string('name', 120).notNullable()
    table.string('slug', 120).notNullable().unique()
    table.integer('sort_order').notNullable().defaultTo(0)
    table.boolean('is_published').notNullable().defaultTo(true)
    table.timestamps(true, true)
  })

  await knex.schema.createTable('gallery_images', (table) => {
    table.increments('id').primary()
    table
      .integer('section_id')
      .unsigned()
      .notNullable()
      .references('gallery_sections.id')
      .onDelete('CASCADE')
    table.string('file_url', 255).notNullable()
    table.string('thumb_url', 255).nullable()
    table.string('alt', 255).defaultTo('')
    table.integer('sort_order').notNullable().defaultTo(0)
    table.boolean('is_published').notNullable().defaultTo(true)
    table.timestamps(true, true)
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('gallery_images')
  await knex.schema.dropTableIfExists('gallery_sections')
  await knex.schema.dropTableIfExists('team_members')
  await knex.schema.dropTableIfExists('site_settings')
  await knex.schema.dropTableIfExists('audit_logs')
  await knex.schema.dropTableIfExists('users')
  await knex.schema.dropTableIfExists('role_permissions')
  await knex.schema.dropTableIfExists('permissions')
  await knex.schema.dropTableIfExists('roles')
}

