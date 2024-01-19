const ACORN_REGEX = /^(.*\.)?acorn\.io\//

export const LABELS_TO_IGNORE_REGEX = [
  ACORN_REGEX,
]

export const ANNOTATIONS_TO_IGNORE_REGEX = [
  ACORN_REGEX,
]

// Labels
export const ACCOUNT_ID = 'acorn.io/account-id'
export const ACCOUNT_NAME = 'acorn.io/account-name'
export const MANAGED = 'acorn.io/managed'
export const APP_NAME = 'acorn.io/app-name'
export const APP_NAMESPACE = 'acorn.io/app-namespace'
export const APP_PARENT = 'acorn.io/parent-acorn-name'
export const APP_WORKSPACE = 'account.manager.acorn.io/workspace'
export const APP_FROM_WORKSPACE = 'account.manager.acorn.io/from-workspace'

// Annotations
export const UI_INITIALIZED = 'ui.acorn.io/initialized'

export const UI_ROLE = 'ui.acorn.io/role'
export const _ROLE_USER = 'user'
export const _ROLE_CONTRACTOR = 'contractor'
export const _ROLE_EMPLOYEE = 'employee'
export const _ROLE_ADMIN = 'admin'
export const _ROLE_DEFAULT = _ROLE_USER

export const UI_HUBSPOT_ID = 'ui.acorn.io/hubspot-id'
export const UI_CHARGEBEE_ID = 'ui.acorn.io/chargebee-id'

export const PLAN = 'manager.acorn.io/plan'
export const _PLAN_FREE = 'free'
export const _PLAN_PRO = 'pro'
export const _PLAN_TEAMS = 'teams'
export const _PLAN_UNLIMITED = 'unlimited-squirrel'
export const _PLAN_DEFAULT = _PLAN_FREE

export const TIMESTAMP = 'acorn.io/timestamp'
export const STOP_TIMESTAMP = 'manager.acorn.io/cleanup-stop-time'
export const REMOVE_TIMESTAMP = 'manager.acorn.io/cleanup-delete-time'

// HubSpot
export const HS_ACCOUNT_NAME = 'accountname'
export const HS_ACCOUNT_PLAN = 'accountplan'

export function acornPlanToHubspot(plan: string) {
  if ( plan === 'unlimited-squirrel' ) {
    return 'Unlimited'
  }

  return titleCase(plan)
}
