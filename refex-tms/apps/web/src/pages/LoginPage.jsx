import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { users, login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  return (
    <div className="login-stage">
      <div className="login-card">
        <img
          src="/refexone-logo.png"
          alt="refexone"
          style={{ height: 44, marginBottom: 18, display: 'block' }}
        />
        <p className="pill">Mock auth · SSO later</p>
        <h2
          style={{
            fontFamily: 'var(--display)',
            fontSize: '1.85rem',
            margin: '14px 0 8px',
            letterSpacing: '-0.03em',
          }}
        >
          Welcome to Travel
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: 0, lineHeight: 1.5 }}>
          Premium pastel booking experience for Refex — pick a role to explore the flow.
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
          {users.map((u, i) => (
            <button
              key={u.id}
              type="button"
              className={`user-pick anim-fade-up anim-delay-${Math.min(i + 1, 3)}`}
              onClick={async () => {
                await login(u.id)
                navigate('/')
              }}
            >
              <span>
                <strong>{u.name}</strong>
                <br />
                <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                  {u.email}
                </span>
              </span>
              <span className={`pill ${u.role === 'travel_desk' ? 'orange' : u.role === 'l1_manager' ? 'mint' : ''}`}>
                {u.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
