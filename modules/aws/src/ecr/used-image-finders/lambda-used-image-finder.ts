import { UsedImageFinder } from '../used-image-finder.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import {
  FunctionConfiguration,
  GetFunctionCommand,
  GetFunctionCommandOutput,
  LambdaClient,
  ListFunctionsCommand,
  ListFunctionsCommandInput,
} from '@aws-sdk/client-lambda';
import { ListFunctionsResponse } from '@aws-sdk/client-lambda/dist-types/models';

export class LambdaUsedImageFinder implements UsedImageFinder {
  constructor(private lambda: LambdaClient) {
    RequireRatchet.notNullOrUndefined(lambda, 'lambda');
  }

  public async findUsedImageUris(): Promise<string[]> {
    const rval: Set<string> = new Set<string>();
    const fns: FunctionConfiguration[] = await this.fetchFunctions();
    Logger.info('Found %d functions', fns.length);
    for (const fn of fns) {
    //for (let i = 0; i < fns.length; i++) {
      if (fn.PackageType === 'Image') {
        const out: GetFunctionCommandOutput = await this.lambda.send(new GetFunctionCommand({ FunctionName: fn.FunctionName }));
        if (out.Code.RepositoryType === 'ECR' && out.Code.ImageUri) {
          rval.add(out.Code.ImageUri);
        }
      } else {
        Logger.info('Skipping zip packaged function: %s', fn.FunctionName);
      }
    }
    return Array.from(rval);
  }

  public async fetchFunctions(): Promise<FunctionConfiguration[]> {
    let rval: any[] = [];
    const cmd: ListFunctionsCommandInput = {};
    let resp: ListFunctionsResponse = null;

    do {
      resp = await this.lambda.send(new ListFunctionsCommand(cmd));
      rval = rval.concat(resp.Functions);
      cmd.Marker = resp.NextMarker;
    } while (StringRatchet.trimToNull(cmd.Marker));

    return rval;
  }
}
