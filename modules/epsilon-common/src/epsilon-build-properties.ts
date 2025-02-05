import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

export class EpsilonBuildProperties {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public readonly buildVersion: string = 'LOCAL-SNAPSHOT';

  public readonly buildHash: string = 'LOCAL-HASH';

  public readonly buildBranch: string = 'LOCAL-BRANCH';

  public readonly buildTag: string = 'LOCAL-TAG';

  public get buildBranchOrTag(): string {
    return StringRatchet.trimToNull(this.buildBranch) ? 'BRANCH:' + this.buildBranch : 'TAG:' + this.buildTag;
  }

  public readonly buildTime: string = 'LOCAL-TIME';
}
