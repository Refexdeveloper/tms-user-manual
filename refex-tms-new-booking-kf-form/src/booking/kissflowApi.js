/**
 * Kissflow Travel_Management_A02 APIs via kf.api (session auth).
 *
 * Save as Draft: create (if new) → update
 * Submit (no draft yet): create → update → submit
 * Submit (after Save Draft): submit only
 *
 * IMPORTANT: always call as window.kf.api(...) — never extract .api or `this` is lost
 * and you get: Cannot read properties of undefined (reading '_postMessageAsync').
 */

/** Initiate-step fields Kissflow rejects with PermissionDeniedToUpdate */
const READONLY_ON_INITIATE = new Set([
  'common_From',
  'common_To',
  'Mode_of_Transport',
  'Eligible_Mode',
  'Booking_Amount_1',
])

const APP_ID = 'Expense_and_Travel_Management_A00'
const PROCESS_ID = 'Travel_Management_A02'

const ENV = {
  development: {
    accountId: 'AcCMptp3yqcn',
  },
  live: {
    accountId: 'AcCMptlq60zH',
  },
}

function getKf() {
  const instance = globalThis?.kf || globalThis?.window?.kf
  if (!instance || typeof instance.api !== 'function') {
    throw new Error('Kissflow SDK (kf.api) is not available. Open this form inside Kissflow.')
  }
  if (instance.isLocal) {
    throw new Error('Kissflow session bridge is not connected. Reload the form inside Kissflow.')
  }
  return instance
}

export function resolveAccountId() {
  const kf = globalThis?.kf || globalThis?.window?.kf
  const fromKf = kf?.account?._id
  if (fromKf) return String(fromKf)

  const host = String(globalThis?.location?.hostname || '').toLowerCase()
  if (host.includes('development')) return ENV.development.accountId
  if (host.includes('refexgroup.kissflow.com') || host.endsWith('kissflow.com')) {
    return ENV.live.accountId
  }
  return ENV.development.accountId
}

function qs() {
  return `_application_id=${encodeURIComponent(APP_ID)}`
}

function processPath(accountId, suffix = '') {
  return `/process/2/${accountId}/${PROCESS_ID}${suffix}?${qs()}`
}

/**
 * Call kf.api with correct `this` binding.
 * Body must be JSON.stringify(object) for POST (same pattern as dashboards).
 */
async function callApi(path, { method = 'GET', body } = {}) {
  const kf = getKf()
  const options = { method }

  if (body != null) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    // Must invoke on kf — extracting kf.api breaks `this._postMessageAsync`
    return await kf.api(path, options)
  } catch (err) {
    const msg =
      err?.en_message ||
      err?.message ||
      err?.error ||
      (typeof err === 'string' ? err : null) ||
      `Kissflow ${method} failed`
    const wrapped = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    wrapped.details = err
    throw wrapped
  }
}

/** One JSON object: _id + writable FieldIds only */
export function buildUpdatePayload(instanceId, fields = {}) {
  const safe = {}
  if (fields && typeof fields === 'object') {
    for (const [key, value] of Object.entries(fields)) {
      if (READONLY_ON_INITIATE.has(key)) continue
      if (key === '_id') continue
      safe[key] = value
    }
  }
  return { _id: instanceId, ...safe }
}

/** 1) Create draft */
export async function createDraft(seedFields = {}) {
  const accountId = resolveAccountId()
  const body = seedFields && Object.keys(seedFields).length ? seedFields : {}
  const created = await callApi(processPath(accountId), {
    method: 'POST',
    body,
  })
  return {
    raw: created,
    instanceId: created?._id || created?.Id || created?.id,
    activityInstanceId: created?._activity_instance_id || created?.ActivityInstanceId,
  }
}

/** 2) Update all fields on the draft activity */
export async function updateDraft(instanceId, activityInstanceId, fields) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for update')
  }
  const accountId = resolveAccountId()
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}`), {
    method: 'POST',
    body: buildUpdatePayload(instanceId, fields),
  })
}

/** 3) Submit into workflow */
export async function submitDraft(instanceId, activityInstanceId, fields = {}) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for submit')
  }
  const accountId = resolveAccountId()
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}/submit`), {
    method: 'POST',
    body: buildUpdatePayload(instanceId, fields),
  })
}

/** Save as Draft: create (if needed) → update */
export async function saveAsDraft(fields, existing) {
  let instanceId = existing?.instanceId
  let activityInstanceId = existing?.activityInstanceId

  if (!instanceId || !activityInstanceId) {
    const created = await createDraft({})
    instanceId = created.instanceId
    activityInstanceId = created.activityInstanceId
    if (!instanceId || !activityInstanceId) {
      throw new Error('Create draft succeeded but ids were missing')
    }
  }

  const updated = await updateDraft(instanceId, activityInstanceId, fields)
  return { instanceId, activityInstanceId, updated, mode: 'draft' }
}

/**
 * Submit button:
 * - Already saved as draft → submit API only
 * - Direct submit → create → update → submit
 */
export async function saveAndSubmit(fields, existing) {
  const hasDraft = Boolean(existing?.instanceId && existing?.activityInstanceId)

  if (hasDraft) {
    const submitted = await submitDraft(existing.instanceId, existing.activityInstanceId, fields)
    return {
      instanceId: existing.instanceId,
      activityInstanceId: existing.activityInstanceId,
      submitted,
      mode: 'submitted',
      path: 'submit-only',
    }
  }

  const draft = await saveAsDraft(fields, null)
  const submitted = await submitDraft(draft.instanceId, draft.activityInstanceId, fields)
  return { ...draft, submitted, mode: 'submitted', path: 'create-update-submit' }
}
