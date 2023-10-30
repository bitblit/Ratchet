import { DateTime } from 'luxon';
import { Logger, StringRatchet } from '@bitblit/ratchet-common';
import fetch from 'cross-fetch';
import util from 'util';
import { GitCommitData, GitRatchet } from '../git/git-ratchet.js';
import { CiRunInformation } from '../../ci/ci-run-information.js';
import { CiRunInformationUtil } from '../../ci/ci-run-information-util.js';
import { ErrorRatchet } from '@bitblit/ratchet-common';

export class PublishCiReleaseToSlack {
  public static async process(slackHookUrl: string, timezone = 'America/Los_Angeles'): Promise<string> {
    if (!slackHookUrl) {
      throw new Error('slackHookUrl must be defined');
    }

    const github: CiRunInformation = CiRunInformationUtil.createDefaultGithubActionsRunInformation();
    const circle: CiRunInformation = CiRunInformationUtil.createDefaultCircleCiRunInformation();
    const testing: CiRunInformation = CiRunInformationUtil.createTestingCiRunInformation();

    const buildNum: string = github.buildNumber || circle.buildNumber || testing.buildNumber;
    const userName: string = github.userName || circle.userName || testing.userName;
    const projectName: string = github.projectName || circle.projectName || testing.projectName;
    const branch: string = github.branch || circle.branch || testing.branch || '';
    const tag: string = github.tag || circle.tag || testing.tag || '';
    const commitHash: string = github.commitHash || circle.commitHash || testing.commitHash || '';
    const localTime: string = DateTime.local().setZone(timezone).toFormat('MMMM Do yyyy, h:mm:ss a z');
    const gitData: GitCommitData = await GitRatchet.getLastCommitSwallowException();

    if (!buildNum || !userName || !projectName) {
      throw ErrorRatchet.fErr(
        'Missing at least one of build number, username, or repo name environmental variables : Github : %j CircleCi: %j Testing: %j',
        github,
        circle,
        testing,
      );
    }

    let message: string = util.format('%s performed release %s on %s at %s', userName, tag + ' ' + branch, projectName, localTime);
    if (!!gitData && !!gitData.subject) {
      message += '\n\n' + gitData.subject;
    }

    Logger.info(
      'Sending slack notification "%s" with build %s, branch %s, tag %s, sha %s, time: %s, url: %s',
      message,
      buildNum,
      branch,
      tag,
      commitHash,
      localTime,
      StringRatchet.obscure(slackHookUrl, 2),
    );

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
    const hook: string = args?.length ? args[0] : null;
    if (!!hook) {
      return PublishCiReleaseToSlack.process(hook);
    } else {
      Logger.infoP('Usage : ratchet-publish-circle-ci-release-to-slack {hookUrl} ...');
      return null;
    }
  }
}
