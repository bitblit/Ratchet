import {
  AthenaClient,
  GetNamedQueryCommand,
  GetNamedQueryCommandOutput,
  GetQueryExecutionCommand,
  GetQueryExecutionCommandOutput,
  ListNamedQueriesCommand,
  ListNamedQueriesCommandOutput,
  NamedQuery,
  Row,
  StartQueryExecutionCommand,
  StartQueryExecutionCommandOutput,
  StartQueryExecutionInput,
} from '@aws-sdk/client-athena';
import { GetObjectCommand, GetObjectCommandOutput, GetObjectRequest, S3Client } from '@aws-sdk/client-s3';
import tmp from 'tmp';
import fs, { WriteStream } from 'fs';
import { Readable } from 'stream';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { CsvRatchet } from '@bitblit/ratchet-node-only/csv/csv-ratchet';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { StopWatch } from '@bitblit/ratchet-common/lang/stop-watch';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

export class AthenaRatchet {
  constructor(
    private athena: AthenaClient,
    private s3: S3Client,
    private outputLocation: string,
  ) {
    RequireRatchet.notNullOrUndefined(athena);
    RequireRatchet.notNullOrUndefined(s3);
    RequireRatchet.notNullOrUndefined(outputLocation);
    RequireRatchet.true(outputLocation.startsWith('s3://'));
  }

  public static athenaRowsToObject<T>(input: Row[]): T[] {
    const colNames: string[] = input[0].Data.map((d) => d.VarCharValue);
    const temp: Row[] = input.slice(1);
    const rval: T[] = temp.map((t) => {
      const newItem: T = {} as T;
      for (let i = 0; i < t.Data.length; i++) {
        newItem[colNames[i]] = t.Data[i].VarCharValue;
      }
      return newItem;
    });
    return rval;
  }

  public async fetchQueryIds(): Promise<string[]> {
    const params = {
      // MaxResults: 0,
      NextToken: null,
    };

    let rval: string[] = [];
    let next: ListNamedQueriesCommandOutput = null;

    do {
      next = await this.athena.send(new ListNamedQueriesCommand(params));
      rval = rval.concat(next.NamedQueryIds);
      params.NextToken = next.NextToken;
    } while (params.NextToken);

    return rval;
  }

  public async listQueries(): Promise<NamedQuery[]> {
    const rval: NamedQuery[] = [];
    const ids: string[] = await this.fetchQueryIds();
    Logger.debug('Finding %d items', ids.length);
    for (const id of ids) {
      //for (let i = 0; i < ids.length; i++) {
      const params = {
        NamedQueryId: id,
      };
      const val: GetNamedQueryCommandOutput = await this.athena.send(new GetNamedQueryCommand(params));
      rval.push(val.NamedQuery);
    }

    return rval;
  }

  public async findQueryByName(name: string): Promise<NamedQuery> {
    const all: NamedQuery[] = await this.listQueries();
    const rval: NamedQuery = all.find((a) => a.Name.toLowerCase() == name.toLowerCase());
    return rval;
  }

  public async runQueryToObjects<T>(queryIn: string, queryParams: any = {}, pingTimeMS = 2000): Promise<T[]> {
    Logger.info('Running query to objects');
    const outputLoc = await this.runQueryToOutputLocation(queryIn, queryParams, pingTimeMS);
    Logger.info('Query succeeded, processing file from %s', outputLoc);

    const bucketName: string = outputLoc.substring(5, outputLoc.indexOf('/', 5));
    const obKey: string = outputLoc.substring(outputLoc.indexOf('/', 5) + 1);

    const req: GetObjectRequest = {
      Bucket: bucketName,
      Key: obKey,
    };
    const getFileOut: GetObjectCommandOutput = await this.s3.send(new GetObjectCommand(req));

    const bodyAsString: string = await getFileOut.Body.transformToString();

    const rval: T[] = await CsvRatchet.stringParse<T>(
      bodyAsString,
      (p) => {
        return p;
      },
      { columns: true, skip_empty_lines: true },
    );

    return rval;
  }

  public async runQueryToFile(queryIn: string, queryParams: any = {}, targetDataFileIn: string = null, pingTimeMS = 2000): Promise<string> {
    Logger.info('Running query to file');
    const outputLoc = await this.runQueryToOutputLocation(queryIn, queryParams, pingTimeMS);
    Logger.info('Query succeeded, pulling file from %s', outputLoc);

    const bucketName: string = outputLoc.substring(5, outputLoc.indexOf('/', 5));
    const obKey: string = outputLoc.substring(outputLoc.indexOf('/', 5) + 1);

    const req: GetObjectRequest = {
      Bucket: bucketName,
      Key: obKey,
    };

    const targetDataFile: string = targetDataFileIn || tmp.fileSync({ postfix: '.csv', keep: false }).name;
    const fileStream: WriteStream = fs.createWriteStream(targetDataFile);
    const output: GetObjectCommandOutput = await this.s3.send(new GetObjectCommand(req));

    const readStream: Readable = output.Body as Readable;
    readStream.pipe(fileStream);

    const rval: string = await PromiseRatchet.resolveOnEvent<string>(readStream, ['finish', 'close'], ['error'], targetDataFile);
    Logger.silly('Response: %s', rval);
    return targetDataFile;
  }

  private async runQueryToOutputLocation(queryIn: string, queryParams: any = {}, pingTimeMS = 2000): Promise<string> {
    let rval: string = null;
    const timer: StopWatch = new StopWatch();
    const query: string = StringRatchet.simpleTemplateFill(queryIn, queryParams, true, '{', '}');

    try {
      Logger.info('Starting query : %s', query);

      const token: string = StringRatchet.createType4Guid();
      const params: StartQueryExecutionInput = {
        QueryString: query,
        ResultConfiguration: {
          /* required */
          OutputLocation: this.outputLocation,
          EncryptionConfiguration: {
            EncryptionOption: 'SSE_S3' /* required */,
            // KmsKey: 'STRING_VALUE'
          },
        },
        ClientRequestToken: token,
        QueryExecutionContext: {
          Database: 'default',
        },
      };

      const startToken: StartQueryExecutionCommandOutput = await this.athena.send(new StartQueryExecutionCommand(params));

      const getExecParams: any = {
        QueryExecutionId: startToken.QueryExecutionId,
      };

      const finalStates: string[] = ['FAILED', 'CANCELLED', 'SUCCEEDED'];
      let curState: GetQueryExecutionCommandOutput = await this.athena.send(new GetQueryExecutionCommand(getExecParams));
      while (finalStates.indexOf(curState.QueryExecution.Status.State) === -1) {
        await PromiseRatchet.createTimeoutPromise('wait', pingTimeMS);
        Logger.debug('%s : %s : %s', curState.QueryExecution.Status.State, timer.dump(), query);
        curState = await this.athena.send(new GetQueryExecutionCommand(getExecParams));
      }

      if (curState.QueryExecution.Status.State === 'FAILED') {
        Logger.warn('Query failed : %s', curState.QueryExecution.Status.StateChangeReason);
      } else if (curState.QueryExecution.Status.State === 'SUCCEEDED') {
        rval = curState.QueryExecution.ResultConfiguration.OutputLocation;
      }
    } catch (err) {
      Logger.warn('Failure : %s', err, err);
    }
    Logger.info('Query took %s : %s', timer.dump(), query);

    return rval;
  }
}
