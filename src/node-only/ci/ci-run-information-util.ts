import { DateTime } from 'luxon';
import { CiRunInformation } from './ci-run-information';
import { NodeRatchet } from '../common/node-ratchet';

export class CiRunInformationUtil {
  public static readonly DEFAULT_TIME_FORMAT: string = 'yyyy-MM-dd HH:mm:ss a z';
  public static readonly DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

  public static createTestingCiRunInformation(timezone = CiRunInformationUtil.DEFAULT_TIME_ZONE): CiRunInformation {
    const now: string = new Date().toISOString();
    const rval: CiRunInformation = {
      buildNumber: 'Test_buildNumberVar_' + now,
      localTime: DateTime.local().setZone(timezone).toFormat(CiRunInformationUtil.DEFAULT_TIME_FORMAT),
      branch: 'Test_branchVar_' + now,
      tag: 'Test_tagVar_' + now,
      commitHash: 'Test_hashVar_' + now,
      userName: 'Test_userNameVar_' + now,
      projectName: 'Test_projectNameVar_' + now,
    };
    return rval;
  }

  public static createDefaultCircleCiRunInformation(timezone = CiRunInformationUtil.DEFAULT_TIME_ZONE): CiRunInformation {
    const rval: CiRunInformation = {
      buildNumber: NodeRatchet.fetchProcessEnvVar('CIRCLE_BUILD_NUM'),
      branch: NodeRatchet.fetchProcessEnvVar('CIRCLE_BRANCH'),
      tag: NodeRatchet.fetchProcessEnvVar('CIRCLE_TAG'),
      commitHash: NodeRatchet.fetchProcessEnvVar('CIRCLE_SHA1'),
      localTime: DateTime.local().setZone(timezone).toFormat(CiRunInformationUtil.DEFAULT_TIME_FORMAT),
      userName: NodeRatchet.fetchProcessEnvVar('CIRCLE_USERNAME'),
      projectName: NodeRatchet.fetchProcessEnvVar('CIRCLE_PROJECT_REPONAME'),
    };
    return rval;
  }

  public static createDefaultGithubActionsRunInformation(timezone = CiRunInformationUtil.DEFAULT_TIME_ZONE): CiRunInformation {
    const rval: CiRunInformation = {
      buildNumber: NodeRatchet.fetchProcessEnvVar('GITHUB_RUN_NUMBER'),
      branch: NodeRatchet.fetchProcessEnvVar('GITHUB_REF_NAME'),
      tag: NodeRatchet.fetchProcessEnvVar('GITHUB_REF_NAME'),
      commitHash: NodeRatchet.fetchProcessEnvVar('GITHUB_SHA'),
      localTime: DateTime.local().setZone(timezone).toFormat(CiRunInformationUtil.DEFAULT_TIME_FORMAT),
      userName: NodeRatchet.fetchProcessEnvVar('GITHUB_ACTOR'),
      projectName: NodeRatchet.fetchProcessEnvVar('GITHUB_REPOSITORY'),
    };
    return rval;
  }
}
