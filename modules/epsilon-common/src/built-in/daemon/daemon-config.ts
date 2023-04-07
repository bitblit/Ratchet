import { DaemonAuthorizerFunction } from './daemon-authorizer-function.js';
import { DaemonGroupSelectionFunction } from './daemon-group-selection-function.js';

export interface DaemonConfig {
  authorizer?: DaemonAuthorizerFunction;
  groupSelector?: DaemonGroupSelectionFunction;
  fetchDaemonStatusPathParameter?: string;
  fetchDaemonStatusByPublicTokenPathParameter?: string;
}
