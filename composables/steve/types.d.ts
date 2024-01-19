export interface LinkMap extends Record<string, string> {}

export interface IManagedField {
  apiVersion?: string
  fieldsType?: string
  fieldsV1?: object
  manager?: string
  operation?: string
  subresource?: string
  time?: Date
}

export interface IOwnerReference {
  apiVersion: string
  blockOwnerDeletion?: boolean
  controller?: boolean
  kind: string
  name: string
  uid: string
}

export type ILabels = Record<string, string>
export type IAnnotations = Record<string, string>

export interface IMetadata {
  annotations?: IAnnotations
  clusterName?: string
  creationTimestamp?: string
  deletionGracePeriodSeconds?: number
  deletionTimestamp?: string
  fields?: string[]
  finalizers?: string[]
  generateName?: string
  generation?: number
  labels?: ILabels
  managedFields?: IManagedField[]
  name?: string
  namespace?: string
  ownerReferences?: IOwnerReference[]
  relationships?: IRelationship[]
  resourceVersion?: string
  selfLink?: string
  uid?: string
  state?: IModelState
}

export interface IModelState {
  name: string
  error: boolean
  transitioning: boolean
  message: string
}

export interface IRelationship {
  fromId: string
  fromType: string
  rel: string
}

export interface IResource {
  __decorated?: number
  id: string
  type: string
  links: LinkMap
  actions?: LinkMap
  metadata: IMetadata
  [x: string]: any
}

export interface IResourceField {
  type: string
  create?: boolean
  update?: boolean
  description?: string
}

export interface IAttributes {
  group: string
  kind: string
  namespaced: boolean
  resource: string
  table: string
  verbs: string[]
  version: string
}

export interface ISchema extends IResource {
  collectionMethods: string[]
  pluralName: string
  resourceFields: Record<string, IResourceField>
  resourceMethods: string[]
  attributes?: IAttributes
}

export interface ICollection<T> {
  type: 'collection'
  links?: LinkMap
  actions?: LinkMap
  createTypes?: LinkMap
  resourceType: string
  resourceVersion?: string
  revision?: string
  data: T[]
}

export interface IAction {
  action?: string
  confirm?: boolean | string | ((IResource) => string)
  label?: string
  labelKey?: string
  icon?: string
  bulkable?: boolean
  bulkAction?: string
  divider?: boolean
  enabled?: boolean
  weight?: number
}
}
