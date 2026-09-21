import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'
import CreateMenu from './CreateMenu'

const roleLabel = {
  employee: 'Employee',
  l1_manager: 'L1 Manager',
  travel_desk: 'Travel Desk',
  finance: 'Finance',
}

function initials(name) {
  return String(name || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Shell() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell tms-shell pm-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <i className="ri-plane-line" />
          </span>
          <div className="brand-copy">
            <h1>Travel Management</h1>
            <p>Book · Approve · Track</p>
          </div>
        </NavLink>
        <nav className="nav-cluster">
          <div className="user-chip">
            <span className="user-avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name.split(' ')[0]}</strong>
              <span>{roleLabel[user.role] || user.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={logout} type="button">
            <i className="ri-refresh-line" /> Switch
          </button>
        </nav>
      </header>

      <div className="module-tabs">
        <NavLink to="/" end className={({ isActive }) => `module-tab${isActive ? ' active' : ''}`}>
          <i className="ri-flight-takeoff-line" /> Travel Booking
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `module-tab${isActive ? ' active' : ''}`}>
          <i className="ri-dashboard-3-line" /> Dashboard
        </NavLink>
        <NavLink to="/advances" className={({ isActive }) => `module-tab${isActive ? ' active' : ''}`}>
          <i className="ri-wallet-3-line" /> Travel Advance
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `module-tab${isActive ? ' active' : ''}`}>
          <i className="ri-receipt-line" /> Travel Expense
        </NavLink>
        {(user.role === 'l1_manager' || user.role === 'travel_desk' || user.role === 'finance') && (
          <NavLink to="/inbox" className={({ isActive }) => `module-tab${isActive ? ' active' : ''}`}>
            <i className="ri-inbox-2-line" /> Inbox
          </NavLink>
        )}
      </div>

      <Outlet />
      <CreateMenu />
    </div>
  )
}
