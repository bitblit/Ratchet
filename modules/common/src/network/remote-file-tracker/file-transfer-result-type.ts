export enum FileTransferResultType {
  Updated = 'Updated', // File was sent
  Skipped = 'Skipped', // Update was skipped for some reason (see logs)
  Error = 'Error',
}
