import 'reflect-metadata';
import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {
    ColumnInfoList,
    GetNamedQueryOutput,
    GetQueryExecutionOutput,
    GetQueryResultsOutput,
    ListNamedQueriesOutput,
    NamedQuery,
    QueryExecutionState,
    Row,
    StartQueryExecutionOutput
} from 'aws-sdk/clients/athena';
import {StringRatchet} from '../common/string-ratchet';
import {Logger} from '../common/logger';
import {StopWatch} from '../common/stop-watch';
import {PromiseRatchet} from '../common/promise-ratchet';
import {DurationRatchet} from '../common/duration-ratchet';

export class AthenaRatchet {

    constructor(private athena: AWS.Athena) {
        if (!athena) {
            throw ('athena may not be null');
        }
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

    public async runQuery(queryIn: string, s3OutputLocation: string, queryParams: any = {}, pingTimeMS: number = 2000): Promise<Row[]> {
        let allRows: Row[] = [];
        const timer: StopWatch = new StopWatch();
        timer.start();
        let query: string = AthenaRatchet.applyParamsToQuery(queryIn, queryParams);

        try {
            Logger.info('Starting query : %s', query);

            const token: string = StringRatchet.createType4Guid();
            const params = {
                QueryString: query,
                ResultConfiguration: {
                    /* required */
                    OutputLocation: s3OutputLocation, /* required */
                    EncryptionConfiguration: {
                        EncryptionOption: 'SSE_S3', /* required */
                        // KmsKey: 'STRING_VALUE'
                    }
                },
                ClientRequestToken: token,
                QueryExecutionContext: {
                    Database: 'default'
                }
            };

            const startToken: PromiseResult<StartQueryExecutionOutput, AWSError> = await this.athena.startQueryExecution(params).promise();

            const getExecParams: any = {QueryExecutionId: startToken.QueryExecutionId};
            let keepRunning: boolean = true;

            while (keepRunning) {
                const curState: PromiseResult<GetQueryExecutionOutput, AWSError> = await this.athena.getQueryExecution(getExecParams).promise();
                const state: QueryExecutionState = curState.QueryExecution.Status.State;
                switch (state) {
                    case 'FAILED' :
                        keepRunning = false;
                        Logger.warn('Query failed : %s', curState.QueryExecution.Status.StateChangeReason);
                        break;
                    case 'CANCELLED' :
                        keepRunning = false;
                        Logger.info('Query cancelled : %s', query);
                        break;
                    case 'SUCCEEDED' :
                        keepRunning = false;
                        Logger.info('Query succeeded : %s', query);
                        break;
                    default:
                        Logger.debug('%s : %s : %s', state, timer.dump(), query);
                }
                const wait: any = (keepRunning) ? await PromiseRatchet.createTimeoutPromise('wait', pingTimeMS) : false;
            }

            let results: PromiseResult<GetQueryResultsOutput, AWSError> = await this.athena.getQueryResults(getExecParams).promise();

            allRows = allRows.concat(results.ResultSet.Rows);
            const columnInfo: ColumnInfoList = results.ResultSet.ResultSetMetadata.ColumnInfo;
            let retryCount: number = 0;
            while (results.NextToken) {
                Logger.info('%d rows pulled so far, pulling more', allRows.length);
                getExecParams['NextToken'] = results.NextToken;
                try {
                    results = await this.athena.getQueryResults(getExecParams).promise();
                    allRows = allRows.concat(results.ResultSet.Rows);
                    retryCount = 0;
                } catch (err) {
                    retryCount++;
                    if (String(err).toLowerCase().indexOf('throttlingexception') !== -1) {
                        const delayMS: number = Math.ceil(1 + (Math.random() * 10000));
                        Logger.info('Throttled - backing off %s MS and trying again : %s', DurationRatchet.formatMsDuration(delayMS, true), query);
                        await PromiseRatchet.wait(delayMS);
                    } else if (retryCount < 4) {
                        Logger.info('Non-throttle exception happened but still have retries - retrying.  Err: %s Qry: %s', err, query);
                        await PromiseRatchet.wait(1000);
                    } else {
                        Logger.warn('Non-throttle exception and out of retries - rethrowing : %s', err);
                        throw err;
                    }
                }
            }

            Logger.info('Pulled %d rows, columns : %j', allRows.length, columnInfo);

        } catch (err) {
            Logger.warn('Failure : %s', err, err);
        }

        Logger.info('Query took %s : %s', timer.dump(), query);

        return allRows;
    }


}
