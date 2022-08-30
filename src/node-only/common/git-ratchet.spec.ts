import { GitRatchet } from './git-ratchet.js';
import { Logger } from '../../common/logger.js';

describe('#gitRatchet', function () {
  it('should fetch last commit data', async () => {
    const res: any = await GitRatchet.getLastCommitSwallowException();
    expect(res).toBeTruthy();
    Logger.info('Got: %j', res);
  });
});
