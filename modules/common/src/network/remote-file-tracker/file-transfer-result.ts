import { FileTransferResultType } from "./file-transfer-result-type.js";
import { BackupResult } from "./backup-result.js";

export interface FileTransferResult {
  type: FileTransferResultType;
  error?: string;
  bytesTransferred?: number;
  backupResult: BackupResult;
}
