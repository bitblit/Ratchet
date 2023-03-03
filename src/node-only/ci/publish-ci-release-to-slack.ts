import { DateTime } from 'luxon';
import { Logger } from '../../common/logger';
import fetch from 'cross-fetch';
import util from 'util';
import { GitCommitData, GitRatchet } from '../common/git-ratchet';
import { NodeRatchet } from '../common/node-ratchet';

export class PublishCiReleaseToSlack {
  public static async process(slackHookUrl: string, timezone = 'America/Los_Angeles'): Promise<string> {
    if (!slackHookUrl) {
      throw new Error('slackHookUrl must be defined');
    }
    const buildNum: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_BUILD_NUM');
    const userName: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_USERNAME');
    const projectName: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_PROJECT_REPONAME');
    const branch: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_BRANCH') || '';
    const tag: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_TAG') || '';
    const sha1: string = NodeRatchet.fetchProcessEnvVar('CIRCLE_SHA1') || '';
    const localTime: string = DateTime.local().setZone(timezone).toFormat('MMMM Do yyyy, h:mm:ss a z');
    const gitData: GitCommitData = await GitRatchet.getLastCommitSwallowException();

    if (!buildNum || !userName || !projectName) {
      throw new Error(
        'CIRCLE_BUILD_NUM, CIRCLE_USERNAME, CIRCLE_PROJECT_REPONAME env vars not set - apparently not in a CircleCI environment'
      );
    }

    Logger.info('Sending slack notification %j with build %s, branch %s, tag %s, sha %s, time: %s', buildNum, branch, tag, sha1, localTime);

    let message: string = util.format('%s performed release %s on %s at %s', userName, tag + ' ' + branch, projectName, localTime);
    if (!!gitData && !!gitData.subject) {
      message += '\n\n' + gitData.subject;
    }

    const response: Response = await fetch(slackHookUrl, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      body: JSON.stringify({ text: message }), // body data type must match "Content-Type" header
    });
    const bodyOut: string = await response.text();

    Logger.info('Slack returned : %s', bodyOut);
    return bodyOut;
  }

  /**
   And, in case you are running this command line...
   TODO: should use switches to allow setting the various non-filename params
   **/
  public static async runFromCliArgs(args: string[]): Promise<string> {
    Logger.info('Running PublishCiReleaseToSlack from command line arguments');
    if (args?.length === 1) {
      return PublishCiReleaseToSlack.process(args[0]);
    } else {
      Logger.infoP('Usage : ratchet-publish-circle-ci-release-to-slack {hookUrl} ...');
      return null;
    }
  }
}
