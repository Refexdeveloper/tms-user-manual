import { getDb, nowIso, withTransaction } from './index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const users = [
  {
    id: 'u-emp-1',
    email: 'gowtham@refex.com',
    name: 'Gowtham S',
    employee_id: 'EMP1001',
    department: 'Operations',
    designation: 'Executive',
    role: 'employee',
    manager_id: 'u-mgr-1',
    mobile: '9876543210',
    cost_centre: 'CC-OPS',
  },
  {
    id: 'u-mgr-1',
    email: 'srivaths@refex.com',
    name: 'Srivaths Varadharajan',
    employee_id: 'EMP2001',
    department: 'Operations',
    designation: 'Manager',
    role: 'l1_manager',
    manager_id: null,
    mobile: '9876543211',
    cost_centre: 'CC-OPS',
  },
  {
    id: 'u-td-1',
    email: 'praveen@refex.com',
    name: 'Praveen V',
    employee_id: 'EMP3001',
    department: 'Travel Desk',
    designation: 'Travel Coordinator',
    role: 'travel_desk',
    manager_id: null,
    mobile: '9876543212',
    cost_centre: 'CC-TD',
  },
  {
    id: 'u-td-2',
    email: 'sujitha@refex.com',
    name: 'Sujitha Nagarajan',
    employee_id: 'EMP3002',
    department: 'Travel Desk',
    designation: 'Travel Coordinator',
    role: 'travel_desk',
    manager_id: null,
    mobile: '9876543213',
    cost_centre: 'CC-TD',
  },
  {
    id: 'u-fin-1',
    email: 'tapas@refex.com',
    name: 'Tapas Das',
    employee_id: 'EMP4001',
    department: 'Finance',
    designation: 'Finance Approver',
    role: 'finance',
    manager_id: null,
    mobile: '9876543214',
    cost_centre: 'CC-FIN',
  },
]

export function seed() {
  const db = getDb()
  const ts = nowIso()
  const upsert = db.prepare(`
    INSERT INTO users (id, email, name, employee_id, department, designation, role, manager_id, mobile, cost_centre, created_at)
    VALUES (@id, @email, @name, @employee_id, @department, @designation, @role, @manager_id, @mobile, @cost_centre, @created_at)
    ON CONFLICT(id) DO UPDATE SET
      email=excluded.email,
      name=excluded.name,
      role=excluded.role,
      manager_id=excluded.manager_id
  `)

  withTransaction(() => {
    for (const u of users) {
      upsert.run({ ...u, created_at: ts })
    }
  })
  console.log(`Seeded ${users.length} mock users`)
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isDirect) seed()
