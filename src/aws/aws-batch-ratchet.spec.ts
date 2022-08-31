import { AwsBatchRatchet } from './aws-batch-ratchet';
import { SubmitJobResponse } from 'aws-sdk/clients/batch';
import * as AWS from 'aws-sdk';
import { Logger } from '../common/logger.js';
import { StopWatch } from '../common/stop-watch.js';

describe('#AwsBatchServie', () => {
  xit('Should schedule dbsync job', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(new AWS.Batch({ region: 'us-east-1' }));
    const sw: StopWatch = new StopWatch();
    sw.start();
    const res: SubmitJobResponse = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, 'JOB-DEFINITION', 'QUEUE-NAME');
    sw.stop();
    expect(res).not.toBeNull();
    Logger.info('submitting job took : %s', sw.dump());
  });
});
