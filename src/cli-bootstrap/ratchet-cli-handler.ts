import { ApplyCiEnvVariablesToFiles } from '../node-only/ci/apply-ci-env-variables-to-files';
import { Logger } from '../common/logger';
import { RatchetInfo } from '../build/ratchet-info';
import { FilesToStaticClass } from '../node-only/common/files-to-static-class';
import { PublishCiReleaseToSlack } from '../node-only/ci/publish-ci-release-to-slack';
import { SiteUploader } from '../site-uploader/site-uploader';
import { StartInstanceAndSsh } from '../node-only/aws/start-instance-and-ssh';
import { CliRatchet } from '../node-only/common/cli-ratchet';

export class RatchetCliHandler {
  private static HANDLER_MAP: Record<string, any> = {
    'apply-ci-env-variables-to-files': ApplyCiEnvVariablesToFiles.runFromCliArgs,
    'files-to-static-class': FilesToStaticClass.runFromCliArgs,
    'print-version-info': RatchetCliHandler.printRatchetVersionInfo,
    'publish-ci-release-to-slack': PublishCiReleaseToSlack.runFromCliArgs,
    'site-uploader': SiteUploader.runFromCliArgs,
    'start-instance-and-ssh': StartInstanceAndSsh.runFromCliArgs,
  };
  public static async findAndExecuteHandler(): Promise<void> {
    let handler: any = null;

    const keys: string[] = Object.keys(RatchetCliHandler.HANDLER_MAP);
    let remainArgs: string[] = null;
    for (let i = 0; i < keys.length && !handler; i++) {
      remainArgs = CliRatchet.argsAfterCommand([keys[i], keys[i] + '.js']);
      if (remainArgs) {
        handler = RatchetCliHandler.HANDLER_MAP[keys[i]];
      }
    }

    if (handler) {
      await handler(remainArgs);
    } else {
      console.log('Unrecognized command : ', process.argv);
      console.log('Valid commands are : ', Object.keys(RatchetCliHandler.HANDLER_MAP));
    }
  }

  private static async printRatchetVersionInfo(ignored: string[]): Promise<void> {
    Logger.info('Ratchet version info : %j', RatchetInfo.fetchBuildInformation());
  }

  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}
