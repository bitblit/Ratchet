export enum DatabaseRequestType {
  Query='Query', // eg Select
  Modify='Modify', // eg Insert/Update/Delete
  Definition='Definition', // eg, DDL
  Meta='Meta' // eg - set transation isolation level
}
