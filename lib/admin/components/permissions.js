// @flow

import type {Permission} from '../../common/user/UserPermissions'

const permissions: Array<Permission> = [
  {
    type: 'manage-feed',
    name: 'Zarządzaj konfiguracją źródeł',
    feedSpecific: true
  },
  {
    type: 'edit-gtfs',
    name: 'Edytuj źródła GTFS',
    feedSpecific: true
  },
  {
    type: 'approve-gtfs',
    name: 'Nadaj źródłą GTFS',
    feedSpecific: true
  },
  {
    type: 'edit-alert',
    name: 'Edytuj alerty GTFS-RT',
    feedSpecific: true,
    module: 'alerts'
  },
  {
    type: 'approve-alert',
    name: 'Zatwierdź alerty GTFS-RT',
    feedSpecific: true,
    module: 'alerts'
  }
]

export default permissions
