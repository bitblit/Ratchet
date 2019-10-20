import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {
    GetNamedQueryOutput,
    GetQueryExecutionOutput,
    ListNamedQueriesOutput,
    NamedQuery,
    Row, StartQueryExecutionInput,
    StartQueryExecutionOutput
} from 'aws-sdk/clients/athena';
import {StringRatchet} from '../common/string-ratchet';
import {Logger} from '../common/logger';
import {StopWatch} from '../common/stop-watch';
import {PromiseRatchet} from '../common/promise-ratchet';
import {RequireRatchet} from '../common/require-ratchet';
import {GetObjectOutput, GetObjectRequest} from 'aws-sdk/clients/s3';
import * as parse from 'csv-parse/lib/sync';
import * as tmp from 'tmp';
import * as fs from 'fs';
import {Readable} from 'stream';

export class AthenaRatchet {

    constructor(private athena: AWS.Athena,private s3: AWS.S3,
    private outputLocation: string) {
        RequireRatchet.notNullOrUndefined(athena);
        RequireRatchet.notNullOrUndefined(s3);
        RequireRatchet.notNullOrUndefined(outputLocation);
        RequireRatchet.true(outputLocation.startsWith('s3://'));
    }

    public static athenaRowsToObject<T>(input: Row[]): T[] {
        const colNames: string[] = input[0].Data.map(d => d.VarCharValue);
        const temp: Row[] = input.slice(1);
        const rval: T[] = temp.map(t => {
            const newItem: T = {} as T;
            for (let i = 0; i < t.Data.length; i++) {
                newItem[colNames[i]] = t.Data[i].VarCharValue;
            }
            return newItem;
        })
        return rval;
    }

    public static applyParamsToQuery(query: string, queryParams: any): string {
        let rval: string = query;
        if (!!rval && !!queryParams) {
            Object.keys(queryParams).forEach(k => {
                const val: string = StringRatchet.safeString(queryParams[k]);
                const kk: string = '{' + k + '}';
                rval = rval.split(kk).join(val);
            });
        }
        return rval;
    }

    public async fetchQueryIds(): Promise<string[]> {
        const params = {
            // MaxResults: 0,
            NextToken: null
        };

        let rval: string[] = [];
        let next: PromiseResult<ListNamedQueriesOutput, AWSError> = null;

        do {
            next = await this.athena.listNamedQueries(params).promise();
            rval = rval.concat(next.NamedQueryIds);
            params.NextToken = next.NextToken;
        } while (!!params.NextToken);

        return rval;
    }

    public async listQueries(): Promise<NamedQuery[]> {
        const rval: NamedQuery[] = [];
        const ids: string[] = await this.fetchQueryIds();
        Logger.debug('Finding %d items', ids.length);
        for (let i = 0; i < ids.length; i++) {
            const params = {
                NamedQueryId: ids[i]
            };
            const val: PromiseResult<GetNamedQueryOutput, AWSError> = await this.athena.getNamedQuery(params).promise();
            rval.push(val.NamedQuery)
        }

        return rval;
    }

    public async findQueryByName(name: string): Promise<NamedQuery> {
        const all: NamedQuery[] = await this.listQueries();
        const rval: NamedQuery = all.find(a => a.Name.toLowerCase() == name.toLowerCase());
        return rval;
    }

    public async runQueryToObjects<T>(queryIn: string, queryParams: any = {}, pingTimeMS: number = 2000): Promise<T[]> {
        Logger.info('Running query to objects');
        const outputLoc = await this.runQueryToOutputLocation(queryIn, queryParams, pingTimeMS);
        Logger.info('Query succeeded, processing file from %s', outputLoc);

        const bucketName: string = outputLoc.substring(5, outputLoc.indexOf('/',5));
        const obKey: string = outputLoc.substring(outputLoc.indexOf('/',5)+1);

        const req: GetObjectRequest = {
            Bucket: bucketName,
            Key: obKey
        };
        const getFileOut: GetObjectOutput = await this.s3.getObject(req).promise();

        const rval:T[] = parse(getFileOut.Body.toString(), {
            columns: true,
            skip_empty_lines: true
        });

        return rval;
    }

    public async runQueryToFile(queryIn: string, queryParams: any = {},
                                   targetDataFile: string = tmp.fileSync({ postfix: '.csv', keep: false }).name
                                   ,pingTimeMS: number = 2000): Promise<string> {
        Logger.info('Running query to file');
        const outputLoc = await this.runQueryToOutputLocation(queryIn, queryParams, pingTimeMS);
        Logger.info('Query succeeded, pulling file from %s', outputLoc);

        const bucketName: string = outputLoc.substring(5, outputLoc.indexOf('/',5));
        const obKey: string = outputLoc.substring(outputLoc.indexOf('/',5)+1);

        const req: GetObjectRequest = {
            Bucket: bucketName,
            Key: obKey
        };

        const fileStream: any = fs.createWriteStream(targetDataFile);
        const readStream: Readable = this.s3.getObject(req).createReadStream();

        readStream.pipe(fileStream);
        const rval: string = await PromiseRatchet.resolveOnEvent<string>(readStream, ['finish', 'close'],
            ['error'], targetDataFile);

        return targetDataFile;
    }


    private async runQueryToOutputLocation(queryIn: string, queryParams: any = {}, pingTimeMS: number = 2000): Promise<string> {
        let rval: string = null;
        const timer: StopWatch = new StopWatch();
        timer.start();
        const query: string = AthenaRatchet.applyParamsToQuery(queryIn, queryParams);

        try {
            Logger.info('Starting query : %s', query);

            const token: string = StringRatchet.createType4Guid();
            const params: StartQueryExecutionInput = {
                QueryString: query,
                ResultConfiguration: {
                    /* required */
                    OutputLocation: this.outputLocation,
                    EncryptionConfiguration: {
                        EncryptionOption: 'SSE_S3' /* required */
                        // KmsKey: 'STRING_VALUE'
                    }
                },
                ClientRequestToken: token,
                QueryExecutionContext: {
                    Database: 'default'
                }
            };

            const startToken: PromiseResult<StartQueryExecutionOutput, AWSError> = await this.athena.startQueryExecution(params).promise();

            const getExecParams: any = {
                QueryExecutionId: startToken.QueryExecutionId
            };

            const finalStates: string[] = ['FAILED', 'CANCELLED', 'SUCCEEDED'];
            let curState: GetQueryExecutionOutput = await this.athena.getQueryExecution(getExecParams).promise();
            while (finalStates.indexOf(curState.QueryExecution.Status.State) === -1) {
                await PromiseRatchet.createTimeoutPromise('wait', pingTimeMS);
                Logger.debug('%s : %s : %s', curState.QueryExecution.Status.State, timer.dump(), query);
                curState = await this.athena.getQueryExecution(getExecParams).promise();
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
