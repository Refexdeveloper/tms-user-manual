import { NavLink, Outlet, useLocation } from 'react-router-dom'
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

const navigation = [
  { to: '/', end: true, icon: 'ri-compass-3-line', label: 'My Travel' },
  { to: '/dashboard', icon: 'ri-layout-grid-line', label: 'Overview' },
  { to: '/advances', icon: 'ri-bank-card-line', label: 'Advances' },
  { to: '/expenses', icon: 'ri-receipt-line', label: 'Expenses' },
]

function pageMeta(pathname) {
  if (pathname.startsWith('/dashboard')) return ['Overview', 'Your travel activity at a glance']
  if (pathname.startsWith('/advances')) return ['Travel advances', 'Manage funds for upcoming journeys']
  if (pathname.startsWith('/expenses')) return ['Travel expenses', 'Submit and track your reimbursements']
  if (pathname.startsWith('/inbox')) return ['Approval inbox', 'Review items waiting for your attention']
  if (pathname.startsWith('/new')) return ['Plan a journey', 'Build and submit a new travel request']
  if (pathname.startsWith('/requests/')) return ['Travel request', 'Review itinerary and approval progress']
  return ['My Travel', 'Plan beautifully. Travel confidently.']
}

export default function Shell() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [pageTitle, pageSubtitle] = pageMeta(pathname)
  const canApprove = ['l1_manager', 'travel_desk', 'finance'].includes(user.role)

  return (
    <div className="tms-app">
      <aside className="tms-sidebar">
        <NavLink to="/" className="tms-brand">
          <span className="tms-brand-mark"><i className="ri-flight-takeoff-line" /></span>
          <span className="tms-brand-copy">
            <strong>Refex Travel</strong>
            <small>Business journeys</small>
          </span>
        </NavLink>

        <nav className="tms-nav" aria-label="Primary navigation">
          <span className="tms-nav-label">Workspace</span>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `tms-nav-item${isActive ? ' active' : ''}`}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {canApprove && (
            <>
              <span className="tms-nav-label tms-nav-label-spaced">Manage</span>
              <NavLink to="/inbox" className={({ isActive }) => `tms-nav-item${isActive ? ' active' : ''}`}>
                <i className="ri-inbox-2-line" />
                <span>Approval inbox</span>
                <b className="tms-nav-dot" aria-hidden />
              </NavLink>
            </>
          )}
        </nav>

        <div className="tms-sidebar-card">
          <i className="ri-shield-check-line" />
          <div>
            <strong>Travel policy</strong>
            <span>Company guidance and booking limits</span>
          </div>
          <i className="ri-arrow-right-up-line" />
        </div>

        <div className="tms-sidebar-profile">
          <span className="user-avatar">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <span>{roleLabel[user.role] || user.role}</span>
          </div>
          <button onClick={logout} type="button" aria-label="Switch account" title="Switch account">
            <i className="ri-logout-box-r-line" />
          </button>
        </div>
      </aside>

      <div className="tms-workspace">
        <header className="tms-topbar">
          <div className="tms-page-heading">
            <span className="tms-mobile-mark"><i className="ri-flight-takeoff-line" /></span>
            <div>
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>
          </div>
          <div className="tms-topbar-actions">
            <button className="tms-icon-btn" type="button" aria-label="Search">
              <i className="ri-search-line" />
            </button>
            <button className="tms-icon-btn tms-notification" type="button" aria-label="Notifications">
              <i className="ri-notification-3-line" />
            </button>
          <div className="user-chip">
              <span className="user-avatar">{initials(user.name)}</span>
              <div>
                <strong>{user.name.split(' ')[0]}</strong>
                <span>{roleLabel[user.role] || user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="tms-content">
          <Outlet />
        </main>
        <CreateMenu />
      </div>
    </div>
  )
}
