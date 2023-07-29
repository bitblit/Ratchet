import { Logger } from '../../../common/logger';
import { GitRatchet } from './git-ratchet';

describe('#gitRatchet', function () {
  it('should fetch last commit data', async () => {
    const res: any = await GitRatchet.getLastCommitSwallowException();
    expect(res).toBeTruthy();
    Logger.info('Got: %j', res);
  }, 10_000); // Ever so often this is slow... and it is really an integration test anyway
});
