import { RemoteStatusData } from "./remote-status-data.js";

export interface RemoteStatusDataAndContent<KeyType>{
  status: RemoteStatusData<KeyType>;
  content: ReadableStream;
}
