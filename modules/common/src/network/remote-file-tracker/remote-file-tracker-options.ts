import { RemoteFileTrackingProvider } from "./remote-file-tracking-provider";

export interface RemoteFileTrackerOptions<KeyType> {
  key: KeyType;
  provider: RemoteFileTrackingProvider<KeyType>;
}
