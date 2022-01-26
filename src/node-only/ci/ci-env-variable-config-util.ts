import { DateTime } from 'luxon';
import { CiEnvVariableConfig } from './ci-env-variable-config';

export class CiEnvVariableConfigUtil {
  public static readonly DEFAULT_TIME_FORMAT: string = 'MMMM Do yyyy, h:mm:ss a z';
  public static readonly DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

  public static createDefaultCircleCiVariableConfig(timezone = CiEnvVariableConfigUtil.DEFAULT_TIME_ZONE): CiEnvVariableConfig {
    const rval: CiEnvVariableConfig = {
      buildNumberVar: 'CIRCLE_BUILD_NUM',
      branchVar: 'CIRCLE_BRANCH',
      tagVar: 'CIRCLE_TAG',
      hashVar: 'CIRCLE_SHA1',
      localTimeVar: null,
      userNameVar: 'CIRCLE_USERNAME',
      projectNameVar: 'CIRCLE_PROJECT_REPONAME',

      branchDefault: '',
      tagDefault: '',
      hashDefault: '',
      localTimeDefault: DateTime.local().setZone(timezone).toFormat(CiEnvVariableConfigUtil.DEFAULT_TIME_FORMAT),
    };
    return rval;
  }

  public static createDefaultGithubActionsVariableConfig(timezone = CiEnvVariableConfigUtil.DEFAULT_TIME_ZONE): CiEnvVariableConfig {
    const rval: CiEnvVariableConfig = {
      buildNumberVar: 'GITHUB_RUN_NUMBER',
      branchVar: 'GITHUB_REF_NAME',
      tagVar: 'GITHUB_REF_NAME',
      hashVar: 'GITHUB_SHA',
      localTimeVar: null,
      userNameVar: 'GITHUB_ACTOR',
      projectNameVar: 'GITHUB_REPOSITORY',

      branchDefault: '',
      tagDefault: '',
      hashDefault: '',
      localTimeDefault: DateTime.local().setZone(timezone).toFormat(CiEnvVariableConfigUtil.DEFAULT_TIME_FORMAT),
    };
    return rval;
  }
}
