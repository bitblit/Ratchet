import {GitRatchet} from './git-ratchet';
import {Logger} from '../../common/logger';

describe('#gitRatchet', function () {
  xit('should fetch last commit data', async () => {
    const res: any = await GitRatchet.getLastCommitSwallowException();
    expect(res).toBeTruthy();
    Logger.info('Got: %j', res);
  });
});
