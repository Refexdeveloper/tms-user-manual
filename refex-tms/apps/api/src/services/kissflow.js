import { config } from '../config.js'

function assertConfigured() {
  if (!config.kissflow.enabled) {
    const err = new Error('Kissflow is not configured. Set KISSFLOW_ACCESS_KEY_ID and KISSFLOW_ACCESS_KEY_SECRET.')
    err.status = 503
    throw err
  }
}

function authHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Access-Key-Id': config.kissflow.accessKeyId,
    'X-Access-Key-Secret': config.kissflow.accessKeySecret,
  }
}

function processBase() {
  const { domain, accountId, processId, appId } = config.kissflow
  return {
    root: `${domain}/process/2/${accountId}/${processId}`,
    appQs: `_application_id=${encodeURIComponent(appId)}`,
  }
}

async function kfFetch(url, { method = 'GET', body } = {}) {
  assertConfigured()
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const msg =
      (typeof data === 'object' && (data.error || data.message || data.Message)) ||
      `Kissflow ${method} ${res.status}`
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    err.status = res.status
    err.details = data
    throw err
  }
  return data
}

export function extractInstanceIds(created) {
  if (!created || typeof created !== 'object') return { instanceId: null, activityInstanceId: null }
  const instanceId =
    created._id ||
    created.Id ||
    created.id ||
    created.InstanceId ||
    created.instance_id ||
    null
  const activityInstanceId =
    created._activity_instance_id ||
    created.ActivityInstanceId ||
    created.activity_instance_id ||
    created._current_activity_instance_id ||
    created.CurrentActivityInstanceId ||
    null
  return { instanceId, activityInstanceId }
}

/** CREATE process item (draft) on Travel_Management_A02 */
export async function createTravelItem(fields) {
  const { root, appQs } = processBase()
  return kfFetch(`${root}?${appQs}`, { method: 'POST', body: fields })
}

/** SUBMIT same instance into workflow */
export async function submitTravelItem(instanceId, activityInstanceId, fields = {}) {
  if (!instanceId || !activityInstanceId) {
    const err = new Error('instanceId and activityInstanceId are required to submit')
    err.status = 400
    throw err
  }
  const { root, appQs } = processBase()
  return kfFetch(`${root}/${instanceId}/${activityInstanceId}/submit?${appQs}`, {
    method: 'POST',
    body: fields,
  })
}

/**
 * Workflow action on current activity.
 * action: submit | reject | sendback | approve (maps to Kissflow path)
 */
export async function actionTravelItem(instanceId, activityInstanceId, action, body = {}) {
  if (!instanceId || !activityInstanceId) {
    const err = new Error('instanceId and activityInstanceId are required')
    err.status = 400
    throw err
  }
  const verb = String(action || 'submit').toLowerCase()
  const path =
    verb === 'approve' || verb === 'submit'
      ? 'submit'
      : verb === 'send_back' || verb === 'sendback'
        ? 'sendback'
        : verb === 'reject'
          ? 'reject'
          : verb
  const { root, appQs } = processBase()
  return kfFetch(`${root}/${instanceId}/${activityInstanceId}/${path}?${appQs}`, {
    method: 'POST',
    body,
  })
}

/** Admin list — keep server-side only */
export async function listTravelItems({ pageNumber = 1, pageSize = 50 } = {}) {
  const { domain, accountId, processId, appId } = config.kissflow
  const url =
    `${domain}/process/2/${accountId}/admin/${processId}/item` +
    `?page_number=${pageNumber}&page_size=${pageSize}&apply_preference=false` +
    `&_application_id=${encodeURIComponent(appId)}`
  return kfFetch(url)
}

export async function getTravelItem(instanceId) {
  const { root, appQs } = processBase()
  return kfFetch(`${root}/${instanceId}?${appQs}`)
}

/** CREATE then SUBMIT as one controlled path */
export async function createAndSubmitTravel(fields) {
  const created = await createTravelItem(fields)
  const { instanceId, activityInstanceId } = extractInstanceIds(created)
  if (!instanceId || !activityInstanceId) {
    return {
      created,
      submitted: null,
      instanceId,
      activityInstanceId,
      warning: 'Created but could not find activity_instance_id for submit',
    }
  }
  const submitted = await submitTravelItem(instanceId, activityInstanceId, fields)
  return { created, submitted, instanceId, activityInstanceId }
}

export function kissflowStatus() {
  return {
    enabled: config.kissflow.enabled,
    domain: config.kissflow.domain,
    accountId: config.kissflow.accountId,
    processId: config.kissflow.processId,
    appId: config.kissflow.appId,
  }
}
