import { UsedImageFinder } from '../used-image-finder';
import { Logger, RequireRatchet, StringRatchet } from '@bitblit/ratchet-common';
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
    for (let i = 0; i < fns.length; i++) {
      if (fns[i].PackageType === 'Image') {
        const out: GetFunctionCommandOutput = await this.lambda.send(new GetFunctionCommand({ FunctionName: fns[i].FunctionName }));
        if (out.Code.RepositoryType === 'ECR' && out.Code.ImageUri) {
          rval.add(out.Code.ImageUri);
        }
      } else {
        Logger.info('Skipping zip packaged function: %s', fns[i].FunctionName);
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
