import { useAuth } from '../auth'

/** Auto-populated requester chip — no wasted full-page step */
export default function CompactRequesterStrip({ purpose, onPurposeChange, extras }) {
  const { user } = useAuth()
  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="requester-strip anim-fade-up">
      <div className="requester-strip-who">
        <span className="requester-avatar">{initials}</span>
        <div>
          <div className="requester-name">{user?.name}</div>
          <div className="requester-meta">
            {user?.employee_id}
            {user?.department ? ` · ${user.department}` : ''}
            {user?.designation ? ` · ${user.designation}` : ''}
          </div>
        </div>
        <span className="pill mint" style={{ marginLeft: 'auto' }}>
          Auto-filled
        </span>
      </div>
      {typeof purpose === 'string' && onPurposeChange && (
        <div className="requester-strip-fields">
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Purpose of travel *</label>
            <input
              placeholder="Client meeting, site visit, training…"
              value={purpose}
              onChange={(e) => onPurposeChange(e.target.value)}
            />
          </div>
          {extras}
        </div>
      )}
    </div>
  )
}
