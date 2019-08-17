import { expect } from 'chai';
import {GitRatchet} from '../../src/common/git-ratchet';
import {Logger} from '../../src/common/logger';

describe('#gitRatchet', function() {
    this.timeout(30000);

    it('should fetch last commit data', async()=> {
        let res: any = await GitRatchet.getLastCommitSwallowException();
        expect(res).to.not.be.null;
        Logger.info('Got: %j', res);
    });


});

