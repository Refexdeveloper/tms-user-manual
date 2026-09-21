/* global kf */

/**
 * Kissflow Travel_Management_A02 APIs via kf.api (session auth).
 *
 * Flow: POST create draft → POST update fields (JSON body) → POST submit
 * Dev host → development account; live host → production account.
 *
 * kf.api requires body: JSON.stringify(payload) — a plain object becomes "[object Object]".
 */

const APP_ID = 'Expense_and_Travel_Management_A00'
const PROCESS_ID = 'Travel_Management_A02'

const ENV = {
  development: {
    accountId: 'AcCMptp3yqcn',
    hostIncludes: 'development-refexgroup.kissflow.com',
  },
  live: {
    accountId: 'AcCMptlq60zH',
    hostIncludes: 'refexgroup.kissflow.com',
  },
}

export function resolveAccountId() {
  const host = String(globalThis?.location?.hostname || '').toLowerCase()
  if (host.includes('development') || host.includes(ENV.development.hostIncludes)) {
    return ENV.development.accountId
  }
  const fromKf = globalThis?.kf?.account?._id
  if (fromKf) return String(fromKf)
  if (host.includes(ENV.live.hostIncludes) || host.endsWith('kissflow.com')) {
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
 * kf.api body MUST be a JSON string (Kissflow SDK docs).
 * Always send a plain object payload as JSON.stringify(...).
 */
async function callApi(path, { method = 'GET', body } = {}) {
  const kfApi = globalThis?.kf?.api
  if (typeof kfApi !== 'function') {
    throw new Error('Kissflow SDK (kf.api) is not available')
  }

  const options = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }

  if (body != null) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  try {
    return await kfApi(path, options)
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

/** Merge field map into one JSON object including _id (required by update API). */
export function buildUpdatePayload(instanceId, fields = {}) {
  return {
    _id: instanceId,
    ...(fields && typeof fields === 'object' ? fields : {}),
  }
}

/** 1) Create draft — returns _id + _activity_instance_id */
export async function createDraft(seedFields = {}) {
  const accountId = resolveAccountId()
  const created = await callApi(processPath(accountId), {
    method: 'POST',
    body: seedFields && Object.keys(seedFields).length ? seedFields : {},
  })
  return {
    raw: created,
    instanceId: created?._id || created?.Id || created?.id,
    activityInstanceId: created?._activity_instance_id || created?.ActivityInstanceId,
  }
}

/**
 * 2) Update draft fields on current activity.
 * POST /process/2/{account}/{process}/{instanceId}/{activityInstanceId}
 * Body: {"_id":"<instanceId>", "Purpose_of_Travel":"Event", "Travel_Mode":"Air", ...}
 * (PUT returns EndpointNotFound on this Kissflow path; POST is the working update verb.)
 */
export async function updateDraft(instanceId, activityInstanceId, fields) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for update')
  }
  const accountId = resolveAccountId()
  const payload = buildUpdatePayload(instanceId, fields)
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}`), {
    method: 'POST',
    body: payload,
  })
}

/** 3) Submit draft into workflow — send same field JSON so required fields validate */
export async function submitDraft(instanceId, activityInstanceId, fields = {}) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for submit')
  }
  const accountId = resolveAccountId()
  const payload = buildUpdatePayload(instanceId, fields)
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}/submit`), {
    method: 'POST',
    body: payload,
  })
}

/** Create (if needed) → update all fields. Does not submit. */
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

/** Create (if needed) → update → submit (fields included on both update and submit) */
export async function saveAndSubmit(fields, existing) {
  const draft = await saveAsDraft(fields, existing)
  const submitted = await submitDraft(draft.instanceId, draft.activityInstanceId, fields)
  return { ...draft, submitted, mode: 'submitted' }
}
