/** Workflow definitions for Air vs Non-Air travel requests */

export const ROLES = {
  EMPLOYEE: 'employee',
  L1: 'l1_manager',
  TRAVEL_DESK: 'travel_desk',
}

export const MODES = {
  AIR: 'air',
  TRAIN: 'train',
  BUS: 'bus',
  CAB: 'cab',
  ACCOMMODATION: 'accommodation',
}

export const AIR_STAGES = {
  DRAFT: 'draft',
  L1_APPROVAL: 'l1_approval',
  TRAVEL_DESK: 'travel_desk',
  BOOKED: 'booked',
  BOARDING_PASS: 'boarding_pass',
  MODIFICATION_TRAVEL_DESK: 'modification_travel_desk',
  MODIFICATION_L1: 'modification_l1',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}

export const NON_AIR_STAGES = {
  DRAFT: 'draft',
  L1_APPROVAL: 'l1_approval',
  TRAVEL_DESK_OPTIONS: 'travel_desk_options',
  EMPLOYEE_SELECTION: 'employee_selection',
  BOOKED: 'booked',
  CLOSED: 'closed',
  REJECTED: 'rejected',
}

export function isAirMode(mode) {
  return mode === MODES.AIR
}

export function initialStage(mode) {
  return isAirMode(mode) ? AIR_STAGES.DRAFT : NON_AIR_STAGES.DRAFT
}

export function stageLabel(stage) {
  const map = {
    draft: 'Draft',
    l1_approval: 'L1 Manager Approval',
    travel_desk: 'Travel Desk – Book / Suggest',
    booked: 'Booked',
    boarding_pass: 'Boarding Pass',
    modification_travel_desk: 'Travel Desk – Modification',
    modification_l1: 'L1 Manager – Modification Approval',
    travel_desk_options: 'Travel Desk – Share Options',
    employee_selection: 'Employee – Select Option',
    closed: 'Closed',
    rejected: 'Rejected',
  }
  return map[stage] || stage
}

/** Hours before boarding when modification is still allowed (Air only) */
export const MODIFICATION_CUTOFF_HOURS = 8

export function canRaiseAirModification(request) {
  if (!isAirMode(request.travel_mode)) return false
  if (![AIR_STAGES.BOOKED, AIR_STAGES.BOARDING_PASS].includes(request.current_stage)) {
    return false
  }
  if (!request.boarding_datetime) return true
  const boarding = new Date(request.boarding_datetime).getTime()
  const cutoff = boarding - MODIFICATION_CUTOFF_HOURS * 60 * 60 * 1000
  return Date.now() <= cutoff
}

/**
 * Apply a workflow action. Returns { nextStage, nextStatus } or throws.
 */
export function transition({ mode, stage, action, payload = {} }) {
  if (isAirMode(mode)) {
    return transitionAir(stage, action, payload)
  }
  return transitionNonAir(stage, action, payload)
}

function transitionAir(stage, action, payload) {
  switch (`${stage}:${action}`) {
    case `${AIR_STAGES.DRAFT}:submit`:
      return { nextStage: AIR_STAGES.L1_APPROVAL, nextStatus: 'pending_l1' }
    case `${AIR_STAGES.L1_APPROVAL}:approve`:
      return { nextStage: AIR_STAGES.TRAVEL_DESK, nextStatus: 'pending_travel_desk' }
    case `${AIR_STAGES.L1_APPROVAL}:reject`:
      return { nextStage: AIR_STAGES.REJECTED, nextStatus: 'rejected' }
    case `${AIR_STAGES.L1_APPROVAL}:modification_request`:
      return { nextStage: AIR_STAGES.DRAFT, nextStatus: 'modification_required' }
    case `${AIR_STAGES.TRAVEL_DESK}:suggest`:
      return { nextStage: AIR_STAGES.TRAVEL_DESK, nextStatus: 'travel_desk_suggested' }
    case `${AIR_STAGES.TRAVEL_DESK}:book`:
      return { nextStage: AIR_STAGES.BOARDING_PASS, nextStatus: 'booked' }
    case `${AIR_STAGES.BOARDING_PASS}:upload_boarding_pass`:
      return { nextStage: AIR_STAGES.BOOKED, nextStatus: 'boarding_pass_uploaded' }
    case `${AIR_STAGES.BOOKED}:close`:
    case `${AIR_STAGES.BOARDING_PASS}:close`:
      return { nextStage: AIR_STAGES.CLOSED, nextStatus: 'closed' }
    case `${AIR_STAGES.BOOKED}:request_modification`:
    case `${AIR_STAGES.BOARDING_PASS}:request_modification`:
      return {
        nextStage: AIR_STAGES.MODIFICATION_TRAVEL_DESK,
        nextStatus: 'modification_pending_travel_desk',
      }
    case `${AIR_STAGES.MODIFICATION_TRAVEL_DESK}:confirm_availability`:
      return {
        nextStage: AIR_STAGES.MODIFICATION_L1,
        nextStatus: 'modification_pending_l1',
      }
    case `${AIR_STAGES.MODIFICATION_TRAVEL_DESK}:reject_modification`:
      return { nextStage: AIR_STAGES.BOOKED, nextStatus: 'booked' }
    case `${AIR_STAGES.MODIFICATION_L1}:approve`:
      return { nextStage: AIR_STAGES.CLOSED, nextStatus: 'closed' }
    case `${AIR_STAGES.MODIFICATION_L1}:reject`:
      return { nextStage: AIR_STAGES.BOOKED, nextStatus: 'booked' }
    default:
      throw new Error(`Invalid Air transition: ${stage} → ${action}`)
  }
}

function transitionNonAir(stage, action) {
  switch (`${stage}:${action}`) {
    case `${NON_AIR_STAGES.DRAFT}:submit`:
      return { nextStage: NON_AIR_STAGES.L1_APPROVAL, nextStatus: 'pending_l1' }
    case `${NON_AIR_STAGES.L1_APPROVAL}:approve`:
      return {
        nextStage: NON_AIR_STAGES.TRAVEL_DESK_OPTIONS,
        nextStatus: 'pending_travel_desk',
      }
    case `${NON_AIR_STAGES.L1_APPROVAL}:reject`:
      return { nextStage: NON_AIR_STAGES.REJECTED, nextStatus: 'rejected' }
    case `${NON_AIR_STAGES.TRAVEL_DESK_OPTIONS}:suggest`:
      return {
        nextStage: NON_AIR_STAGES.EMPLOYEE_SELECTION,
        nextStatus: 'awaiting_employee_selection',
      }
    case `${NON_AIR_STAGES.EMPLOYEE_SELECTION}:select_option`:
      return { nextStage: NON_AIR_STAGES.BOOKED, nextStatus: 'booked' }
    case `${NON_AIR_STAGES.BOOKED}:collect_amount`:
    case `${NON_AIR_STAGES.BOOKED}:close`:
      return { nextStage: NON_AIR_STAGES.CLOSED, nextStatus: 'closed' }
    default:
      throw new Error(`Invalid Non-Air transition: ${stage} → ${action}`)
  }
}

export function timelineFor(mode, currentStage, status) {
  const airOrder = [
    AIR_STAGES.DRAFT,
    AIR_STAGES.L1_APPROVAL,
    AIR_STAGES.TRAVEL_DESK,
    AIR_STAGES.BOARDING_PASS,
    AIR_STAGES.BOOKED,
    AIR_STAGES.CLOSED,
  ]
  const nonAirOrder = [
    NON_AIR_STAGES.DRAFT,
    NON_AIR_STAGES.L1_APPROVAL,
    NON_AIR_STAGES.TRAVEL_DESK_OPTIONS,
    NON_AIR_STAGES.EMPLOYEE_SELECTION,
    NON_AIR_STAGES.BOOKED,
    NON_AIR_STAGES.CLOSED,
  ]
  const order = isAirMode(mode) ? airOrder : nonAirOrder
  const idx = order.indexOf(currentStage)
  return order.map((stage, i) => {
    let state = 'not_started'
    if (status === 'rejected' && stage === AIR_STAGES.REJECTED) state = 'rejected'
    else if (currentStage === stage) state = 'current'
    else if (idx >= 0 && i < idx) state = 'done'
    else if (currentStage === AIR_STAGES.CLOSED || currentStage === NON_AIR_STAGES.CLOSED) {
      state = i <= order.indexOf(isAirMode(mode) ? AIR_STAGES.CLOSED : NON_AIR_STAGES.CLOSED)
        ? 'done'
        : 'not_started'
    }
    return { stage, label: stageLabel(stage), state }
  })
}
