#!/usr/bin/env node
require('dotenv').config()

const readline = require('node:readline/promises')
const { stdin: input, stdout: output } = require('node:process')

const bcrypt = require('bcrypt')

const db = require('../src/db')
const { JWT_SECRET } = require('../src/config')

async function ensureRolesAndPermissions() {
  // Insert standard roles/permissions if the tables are empty.
  const rolesCount = await db('roles').count({ c: '*' }).first()
  const permsCount = await db('permissions').count({ c: '*' }).first()

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

  if (!rolesCount || Number(rolesCount.c) === 0) await db('roles').insert(roles)
  if (!permsCount || Number(permsCount.c) === 0) await db('permissions').insert(permissions)

  const rolePermsCount = await db('role_permissions').count({ c: '*' }).first()
  if (rolePermsCount && Number(rolePermsCount.c) > 0) return

  const roleRows = await db('roles').select('*')
  const permRows = await db('permissions').select('*')
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
    await db('role_permissions').insert(mappings)
  }
}

async function main() {
  if (!JWT_SECRET || JWT_SECRET === 'dev-change-me') {
    console.warn(
      'Warning: JWT_SECRET is not set (or still default). Set JWT_SECRET in your environment before creating admins.',
    )
  }

  await ensureRolesAndPermissions()

  const superAdminRole = await db('roles').select('id').where({ name: 'super_admin' }).first()
  if (!superAdminRole) throw new Error('super_admin role missing')

  const existing = await db('users')
    .select('id')
    .where({ role_id: superAdminRole.id })
    .first()

  if (existing) {
    console.log('Super admin already exists. Bootstrap is a one-time operation.')
    return
  }

  const rl = readline.createInterface({ input, output })
  try {
    const email =
      process.env.BOOTSTRAP_EMAIL ||
      (await rl.question('Enter super admin email: ')).trim().toLowerCase()

    // Note: CLI password input is visible; for stronger security, you can provide BOOTSTRAP_PASSWORD.
    const password =
      process.env.BOOTSTRAP_PASSWORD || (await rl.question('Enter password: ')).trim()

    if (!email) throw new Error('Email is required')
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters')

    const password_hash = await bcrypt.hash(password, 12)
    await db('users').insert({
      email,
      password_hash,
      role_id: superAdminRole.id,
      is_active: true,
    })

    console.log('Super admin created successfully.')
  } finally {
    rl.close()
    await db.destroy()
  }
}

main().catch((err) => {
  // Ensure knex connections are closed on failure.
  console.error(err)
  process.exitCode = 1
})

