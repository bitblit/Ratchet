import { RemoteFileTrackingProvider } from "./remote-file-tracking-provider.js";

export interface RemoteFileTrackerOptions<KeyType> {
  key: KeyType;
  provider: RemoteFileTrackingProvider<KeyType>;
}
