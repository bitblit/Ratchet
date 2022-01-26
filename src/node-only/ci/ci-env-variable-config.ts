import { DateTime } from 'luxon';
import { GitCommitData, GitRatchet } from '../common/git-ratchet';

export interface CiEnvVariableConfig {
  buildNumberVar: string; // You MUST set this one
  branchVar?: string;
  tagVar?: string;
  hashVar?: string;
  localTimeVar?: string;
  userNameVar?: string;
  projectNameVar?: string;

  branchDefault?: string;
  tagDefault?: string;
  hashDefault?: string;
  localTimeDefault?: string;
}
