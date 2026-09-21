export const TRAVEL_MODES = [
  {
    id: 'air',
    label: 'Flights',
    tagline: 'Live fares · One way, round trip & multi-city',
    icon: '✈',
    accent: '#d7e9f8',
    accentStrong: '#2d7bbf',
    available: true,
  },
  {
    id: 'train',
    label: 'Trains',
    tagline: 'Station search · Travel Desk fulfilment',
    icon: '🚆',
    accent: '#e4f4d8',
    accentStrong: '#70b62c',
    available: true,
  },
  {
    id: 'bus',
    label: 'Buses',
    tagline: 'City search · Travel Desk options',
    icon: '🚌',
    accent: '#fff3d9',
    accentStrong: '#c47a14',
    available: true,
  },
  {
    id: 'cab',
    label: 'Cabs',
    tagline: 'Green Mobility & outstation cabs',
    icon: '🚕',
    accent: '#eeeffb',
    accentStrong: '#6b5ce7',
    available: true,
  },
  {
    id: 'accommodation',
    label: 'Hotels',
    tagline: 'City stay · Check-in & check-out',
    icon: '🏨',
    accent: '#fde6d8',
    accentStrong: '#e86c3d',
    available: true,
  },
]

export function modeMeta(id) {
  return TRAVEL_MODES.find((m) => m.id === id) || TRAVEL_MODES[0]
}

export const STATUS_STYLES = {
  draft: { label: 'Draft', tone: 'muted' },
  pending_l1: { label: 'Pending L1 Approval', tone: 'warn' },
  modification_required: { label: 'Modification Required', tone: 'danger' },
  modification_pending_travel_desk: { label: 'Modification – Travel Desk', tone: 'warn' },
  modification_pending_l1: { label: 'Modification – L1 Approval', tone: 'warn' },
  pending_travel_desk: { label: 'With Travel Desk', tone: 'brand' },
  travel_desk_suggested: { label: 'Options Shared', tone: 'brand' },
  awaiting_employee_selection: { label: 'Select Your Option', tone: 'warn' },
  booked: { label: 'Booked', tone: 'success' },
  boarding_pass_uploaded: { label: 'Boarding Pass Added', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
}

export function statusMeta(status) {
  return STATUS_STYLES[status] || { label: status || 'Unknown', tone: 'muted' }
}

export const ACTION_LABELS = {
  draft_created: 'Draft created',
  draft_updated: 'Request updated',
  submit: 'Submitted for approval',
  approve: 'Approved',
  reject: 'Rejected',
  modification_request: 'Modification requested',
  suggest: 'Options shared',
  book: 'Booking confirmed',
  select_option: 'Option selected',
  upload_boarding_pass: 'Boarding pass uploaded',
  close: 'Closed',
  confirm_availability: 'Availability confirmed',
  reject_modification: 'Modification declined',
}

export function actionLabel(action) {
  return ACTION_LABELS[action] || action
}

export function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function formatMoney(amount, currency = 'INR') {
  if (amount === null || amount === undefined || amount === '') return '—'
  const symbol = currency === 'INR' ? '₹' : currency + ' '
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`
}
