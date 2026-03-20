const roles = [
  { name: 'super_admin' },
  { name: 'admin' },
  { name: 'manager' },
]

const permissions = [
  { key: 'site_settings.read', description: 'Read site settings' },
  { key: 'site_settings.write', description: 'Update site settings' },
  { key: 'team.read', description: 'Read team members' },
  { key: 'team.write', description: 'Create/update team members' },
  { key: 'gallery.read', description: 'Read gallery sections/images' },
  { key: 'gallery.write', description: 'Create/update gallery sections/images' },
  { key: 'gallery.images.upload', description: 'Upload gallery images' },
  { key: 'users.read', description: 'Read admin users (super_admin only)' },
  { key: 'users.write', description: 'Manage admin users/roles (super_admin only)' },
]

// Role -> permissions
const rolePermissionKeys = {
  super_admin: permissions.map((p) => p.key),
  admin: [
    'site_settings.read',
    'site_settings.write',
    'team.read',
    'team.write',
    'gallery.read',
    'gallery.write',
    'gallery.images.upload',
  ],
  manager: ['gallery.read', 'gallery.write', 'gallery.images.upload'],
}

exports.seed = async function seed(knex) {
  // Only reset role-permission mappings; keep roles/permissions stable to avoid breaking FK references.
  await knex('role_permissions').del()

  // Ensure roles exist.
  for (const role of roles) {
    // SQLite + MySQL: ignore duplicates by unique `name`.
    // eslint-disable-next-line no-await-in-loop
    await knex('roles').insert(role).onConflict('name').ignore()
  }

  // Ensure permissions exist.
  for (const perm of permissions) {
    // eslint-disable-next-line no-await-in-loop
    await knex('permissions').insert(perm).onConflict('key').ignore()
  }

  const roleRows = await knex('roles').select('*')
  const permRows = await knex('permissions').select('*')

  const roleIdByName = Object.fromEntries(roleRows.map((r) => [r.name, r.id]))
  const permIdByKey = Object.fromEntries(permRows.map((p) => [p.key, p.id]))

  const mappings = []
  for (const roleName of Object.keys(rolePermissionKeys)) {
    const roleId = roleIdByName[roleName]
    for (const key of rolePermissionKeys[roleName]) {
      const permissionId = permIdByKey[key]
      if (!permissionId) continue
      mappings.push({ role_id: roleId, permission_id: permissionId })
    }
  }

  if (mappings.length) {
    await knex('role_permissions').insert(mappings)
  }
}

