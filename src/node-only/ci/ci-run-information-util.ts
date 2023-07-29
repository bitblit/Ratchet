import { DateTime } from 'luxon';
import { GlobalRatchet } from '../../common/global-ratchet';
import { CiRunInformation } from './ci-run-information';

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
      buildNumber: GlobalRatchet.fetchGlobalVar('CIRCLE_BUILD_NUM'),
      branch: GlobalRatchet.fetchGlobalVar('CIRCLE_BRANCH'),
      tag: GlobalRatchet.fetchGlobalVar('CIRCLE_TAG'),
      commitHash: GlobalRatchet.fetchGlobalVar('CIRCLE_SHA1'),
      localTime: DateTime.local().setZone(timezone).toFormat(CiRunInformationUtil.DEFAULT_TIME_FORMAT),
      userName: GlobalRatchet.fetchGlobalVar('CIRCLE_USERNAME'),
      projectName: GlobalRatchet.fetchGlobalVar('CIRCLE_PROJECT_REPONAME'),
    };
    return rval;
  }

  public static createDefaultGithubActionsRunInformation(timezone = CiRunInformationUtil.DEFAULT_TIME_ZONE): CiRunInformation {
    const rval: CiRunInformation = {
      buildNumber: GlobalRatchet.fetchGlobalVar('GITHUB_RUN_NUMBER'),
      branch: GlobalRatchet.fetchGlobalVar('GITHUB_REF_NAME'),
      tag: GlobalRatchet.fetchGlobalVar('GITHUB_REF_NAME'),
      commitHash: GlobalRatchet.fetchGlobalVar('GITHUB_SHA'),
      localTime: DateTime.local().setZone(timezone).toFormat(CiRunInformationUtil.DEFAULT_TIME_FORMAT),
      userName: GlobalRatchet.fetchGlobalVar('GITHUB_ACTOR'),
      projectName: GlobalRatchet.fetchGlobalVar('GITHUB_REPOSITORY'),
    };
    return rval;
  }
}
