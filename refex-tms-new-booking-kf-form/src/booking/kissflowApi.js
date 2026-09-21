/**
 * Kissflow Travel_Management_A02 process APIs
 * Dev:  development-refexgroup.kissflow.com / AcCMptp3yqcn
 * Live: refexgroup.kissflow.com / AcCMptlq60zH
 *
 * Flow: POST create draft → PUT/POST update fields → POST submit
 */
import { kf } from '../sdk'

export const APP_ID = 'Expense_and_Travel_Management_A00'
export const PROCESS_ID = 'Travel_Management_A02'

export function resolveKissflowEnv() {
  const host = typeof window !== 'undefined' ? window.location?.hostname || '' : ''
  const isDev =
    host.includes('development-') ||
    host.includes('localhost') ||
    host.includes('127.0.0.1')
  if (isDev) {
    return {
      env: 'development',
      domain: 'https://development-refexgroup.kissflow.com',
      accountId: 'AcCMptp3yqcn',
    }
  }
  return {
    env: 'live',
    domain: 'https://refexgroup.kissflow.com',
    accountId: 'AcCMptlq60zH',
  }
}

function qs() {
  return `_application_id=${encodeURIComponent(APP_ID)}`
}

function processPath(accountId, suffix = '') {
  return `/process/2/${accountId}/${PROCESS_ID}${suffix}?${qs()}`
}

async function callApi(path, { method = 'GET', body } = {}) {
  if (!kf?.api) {
    throw new Error('Kissflow SDK not available. Open this Form inside Kissflow.')
  }
  const options = { method }
  if (body != null) options.body = body
  return kf.api(path, options)
}

export async function getAccountId() {
  try {
    const id = await kf.account?._id
    if (id) return id
  } catch {
    /* fall through */
  }
  return resolveKissflowEnv().accountId
}

/** 1) Create draft — returns _id + _activity_instance_id */
export async function createDraft(seedFields = {}) {
  const accountId = await getAccountId()
  const created = await callApi(processPath(accountId), {
    method: 'POST',
    body: seedFields,
  })
  return {
    instanceId: created?._id || created?.Id,
    activityInstanceId: created?._activity_instance_id || created?.ActivityInstanceId,
    raw: created,
  }
}

/** 2) Update draft fields */
export async function updateDraft(instanceId, activityInstanceId, fields) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for update')
  }
  const accountId = await getAccountId()
  const body = { _id: instanceId, ...fields }
  // Kissflow process item update
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}`), {
    method: 'PUT',
    body,
  })
}

/** 3) Submit into workflow */
export async function submitDraft(instanceId, activityInstanceId, fields = {}) {
  if (!instanceId || !activityInstanceId) {
    throw new Error('Missing instanceId / activityInstanceId for submit')
  }
  const accountId = await getAccountId()
  return callApi(processPath(accountId, `/${instanceId}/${activityInstanceId}/submit`), {
    method: 'POST',
    body: fields,
  })
}

/** Create (if needed) → update all fields. Does not submit. */
export async function saveAsDraft(fields, existing) {
  let instanceId = existing?.instanceId
  let activityInstanceId = existing?.activityInstanceId
  let created = null

  if (!instanceId || !activityInstanceId) {
    const draft = await createDraft({})
    instanceId = draft.instanceId
    activityInstanceId = draft.activityInstanceId
    created = draft.raw
  }

  const updated = await updateDraft(instanceId, activityInstanceId, fields)
  return { instanceId, activityInstanceId, created, updated, mode: 'draft' }
}

/** Create (if needed) → update → submit */
export async function saveAndSubmit(fields, existing) {
  const draft = await saveAsDraft(fields, existing)
  const submitted = await submitDraft(draft.instanceId, draft.activityInstanceId, {})
  return { ...draft, submitted, mode: 'submitted' }
}
