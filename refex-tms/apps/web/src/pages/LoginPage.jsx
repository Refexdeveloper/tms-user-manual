import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { HERO_PLANE } from '../travelMedia'

export default function LoginPage() {
  const { users, login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  return (
    <div className="login-stage">
      <section className="login-visual">
        <img src={HERO_PLANE} alt="" />
        <div className="login-visual-shade" />
        <div className="login-brand">
          <span className="tms-brand-mark"><i className="ri-flight-takeoff-line" /></span>
          <strong>Refex Travel</strong>
        </div>
        <div className="login-visual-copy">
          <span className="login-kicker">Travel, thoughtfully managed</span>
          <h1>Business journeys,<br />beautifully simple.</h1>
          <p>Plan, approve and track every trip from one considered workspace.</p>
        </div>
        <div className="login-trust">
          <span><i className="ri-shield-check-line" /> Policy aware</span>
          <span><i className="ri-time-line" /> Faster approvals</span>
          <span><i className="ri-customer-service-2-line" /> Travel desk support</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <p className="login-overline">Welcome back</p>
          <h2>Continue to your workspace</h2>
          <p className="login-intro">Choose a profile to preview the travel experience.</p>
          <div className="login-users">
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
              <span className="login-user-avatar">
                {u.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}
              </span>
              <span className="login-user-copy">
                <strong>{u.name}</strong>
                <small>{u.email}</small>
              </span>
              <span className="login-role">
                {u.role.replaceAll('_', ' ')}
              </span>
              <i className="ri-arrow-right-line login-user-arrow" />
            </button>
          ))}
          </div>
          <p className="login-disclaimer"><i className="ri-lock-2-line" /> Secure company access · SSO ready</p>
        </div>
      </section>
    </div>
  )
}
