import {
  DurationRatchet,
  ErrorRatchet,
  Logger,
  PromiseRatchet,
  StopWatch,
  TimeoutToken
} from "@bitblit/ratchet-common";
import { QueryUtil } from "../query-builder/query-util.js";
import { TransactionIsolationLevel } from "../model/transaction-isolation-level.js";
import { QueryBuilder } from "../query-builder/query-builder.js";
import { GroupByCountResult } from "../model/group-by-count-result.js";
import { QueryDefaults } from "../model/query-defaults.js";
import { QueryTextProvider } from "../model/query-text-provider.js";
import { UpdateResults } from "../model/update-results";
import { DatabaseAccessProvider } from "../model/database-access-provider";
import { DatabaseAccess } from "../model/database-access";
import { QueryResults } from "../model/query-results";

/**
 * Service to simplify talking to any Mysql dialect system
 *
 * 2021-05-31 : This is a refactor of MariaDbService that supports named parameters
 * and conditional blocks, but does NOT support string substitution.  Using this approach
 * removes the possibility of SQL injection.  I am putting this is as a separate class to
 * make it easy to transition - as a dao gets refactored to use the new system, it can simply
 * change which service gets injected.  Once nothing is injecting the old service, we can
 * remove it entirely.
 *
 * Conditional sections use the <<xx>>yyy<</>> syntax
 * If your conditional section uses the <<:zz>>yyy<</>> then the section is included if named parameter zz is set not null/undefined and if it is an array the length is greater than zero.
 */

export class NamedParameterDatabaseService {
  private static LONG_QUERY_TIME_MS = 8500;

  private serviceName = 'TBD';

  constructor(
    private queryProvider: QueryTextProvider,
    private connectionProvider: DatabaseAccessProvider,
    private queryDefaults: QueryDefaults
  ) {
    this.serviceName = 'NamedParameterDatabaseService';
  }

  public nonPooledExtraConfiguration(): Record<string,any> {
    return null;
  }

  public nonPooledMode(): boolean {
    return false;
  }

  public get databaseAccessProvider(): DatabaseAccessProvider {
    return this.connectionProvider;
  }


  public getQueryDefaults(): QueryDefaults {
    return this.queryDefaults;
  }

  public getQueryProvider(): QueryTextProvider {
    return this.queryProvider;
  }

  public async createNonPooledDatabaseAccess(
    queryDefaults: QueryDefaults,
    additionalConfig?: Record<string,any>
  ): Promise<DatabaseAccess> {
    Logger.info('createTransactional :  %s : %j', queryDefaults, additionalConfig);
    if (!this.connectionProvider.createNonPooledDatabaseAccess) {
      throw new Error(`Connection provider does not implement createNonPooledDatabaseAccess`);
    }
    const newConn: DatabaseAccess = await this.connectionProvider.createNonPooledDatabaseAccess(queryDefaults, additionalConfig);
    if (!newConn) {
      throw new Error(`Connection could not be created for DB type ${queryDefaults}`);
    }
    return newConn;
  }

  public fetchQueryRawTextByName(queryPath: string): string {
    return this.queryProvider.fetchQuery(queryPath);
  }

  public queryBuilder(queryPath?: string): QueryBuilder {
    const queryBuilder = new QueryBuilder(this.queryProvider);
    if (queryPath) {
      queryBuilder.withNamedQuery(queryPath);
    }
    return queryBuilder;
  }

  public async executeUpdateOrInsertByName(
    queryPath: string,
    params?: object,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<UpdateResults> {
    const builder = this.queryBuilder(queryPath).withParams(params ?? {});
    return this.buildAndExecuteUpdateOrInsert(builder, timeoutMS);
  }

  public async buildAndExecuteUpdateOrInsert(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<UpdateResults> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<UpdateResults>(
      build.transactionIsolationLevel,
      build.query,
      build.namedParams,
      timeoutMS
    );
    const rval = resp.results;
    return rval;
  }

  public async buildAndExecuteUpdateOrInsertWithRetry(
    queryBuilder: QueryBuilder,
    maxRetries: number,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<UpdateResults> {
    let retry = 0;
    let res: UpdateResults | undefined;
    while (!res && retry < maxRetries) {
      retry++;
      try {
        res = await this.buildAndExecuteUpdateOrInsert(queryBuilder, timeoutMS);
      } catch (err) {
        Logger.info('Caught problem while trying to update/insert : %d : %s ', retry, err);
        await PromiseRatchet.wait(retry * 2000);
      }
    }

    if (!res) {
      throw new Error(`Failed to execute update after ${maxRetries} retries`);
    }

    return res;
  }

  public async executeQueryByName<Row>(
    queryPath: string,
    params: object,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<Row[]> {
    const builder = this.queryBuilder(queryPath).withParams(params);
    const resp: Row[] = await this.buildAndExecute(builder, timeoutMS);
    return resp;
  }

  public async executeQueryByNameSingle<Row>(
    queryPath: string,
    params: object,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<Row | null> {
    const builder = this.queryBuilder(queryPath).withParams(params);
    const resp = await this.buildAndExecute<Row>(builder, timeoutMS);
    return resp.length === 1 ? resp[0] : null;
  }

  public async buildAndExecute<Row>(queryBuilder: QueryBuilder, timeoutMS: number = this.queryDefaults.timeoutMS): Promise<Row[]> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<Row[]>(
      build.transactionIsolationLevel,
      build.query,
      build.namedParams,
      timeoutMS,
      queryBuilder.getDebugComment()
    );
    return resp.results;
  }

  public async buildAndExecuteSingle<Row>(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<Row | null> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<Row[]>(
      build.transactionIsolationLevel,
      build.query,
      build.namedParams,
      timeoutMS,
      queryBuilder.getDebugComment()
    );
    return resp.results.length === 1 ? resp.results[0] : null;
  }

  public async buildAndExecuteFetchTotalRows(
    queryBuilder: QueryBuilder,
    groupBy = '',
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<GroupByCountResult[]> {
    const buildUnfiltered = queryBuilder.buildUnfiltered();
    let query = buildUnfiltered.query.replace('COUNT(*)', `${groupBy} as groupByField, COUNT(*) as count`);
    query = `${query} GROUP BY ${groupBy}`;

    Logger.info('Unfiltered query %s', buildUnfiltered.query);
    const resp = await this.executeQueryWithMeta<GroupByCountResult[]>(
      buildUnfiltered.transactionIsolationLevel,
      query,
      buildUnfiltered.namedParams,
      timeoutMS
    );

    return resp.results;
  }

  public async executeQueryWithMeta<Row>(
    transactionIsolationLevel: TransactionIsolationLevel,
    query: string,
    fields: object = {},
    timeoutMS: number = this.queryDefaults.timeoutMS,
    debugComment?: string
  ): Promise<QueryResults<Row>> {
    const sw: StopWatch = new StopWatch();
    if (!timeoutMS) {
      timeoutMS = this.queryDefaults.timeoutMS;
    }

    await this.changeNextQueryTransactionIsolationLevel(transactionIsolationLevel);

    const result = await PromiseRatchet.timeout<QueryResults<Row>>(
      this.innerExecutePreparedAsPromiseWithRetryCloseConnection<Row>(query, fields, undefined),
      'Query:' + query,
      timeoutMS
    );

    if (TimeoutToken.isTimeoutToken(result)) {
      Logger.warn('Timed out (after %s): %j', DurationRatchet.colonFormatMsDuration(timeoutMS), result);
      const duration = DurationRatchet.colonFormatMsDuration(timeoutMS);
      throw new Error(`Timed out (after ${duration}) waiting for query : ${query}`);
    }
    const rval = result as QueryResults<Row>;
    if (!rval.results) {
      Logger.error('DB:executeQueryWithMeta:Failure: %j', rval);
    }

    if (debugComment && sw.elapsedMS() > NamedParameterDatabaseService.LONG_QUERY_TIME_MS) {
      Logger.info('NamedParameterDatabaseService long query: %s, %s', debugComment, sw.dump());
    }
    return rval;
  }

  public async shutdown(): Promise<boolean> {
    Logger.info('Shutting down %s service', this.serviceName);
    let rval: boolean;
    try {
      rval = await this.connectionProvider.clearDatabaseAccessCache();
    } catch (err) {
      Logger.error('Failure trying to shutdown : %s', err, err);
      rval = false;
    }
    return rval;
  }

  public async testConnection(quietMode = false): Promise<number | null> {
    if (!quietMode) {
      Logger.info('Running connection test');
    }
    const res = await this.executeQueryWithMeta(TransactionIsolationLevel.Default, 'SELECT UNIX_TIMESTAMP(now())*1000 AS test');
    const rows = res.results as { test: number }[];
    const timestamp = rows.length === 1 ? rows[0].test : null;
    if (!quietMode) {
      Logger.info('Test returned : %j', timestamp);
    }
    return timestamp;
  }

  public async testDbFailure(): Promise<void> {
    // This just executes a query guaranteed to fail to generate a db query failure
    await this.executeQueryWithMeta(TransactionIsolationLevel.Default, 'this is a bad query');
  }

  public async changeNextQueryTransactionIsolationLevel<Row>(
    tx: TransactionIsolationLevel | null
  ): Promise<QueryResults<Row> | null> {
    if (tx && tx !== TransactionIsolationLevel.Default) {
      Logger.debug('Setting tx to %s', tx);
      return await this.innerExecutePreparedAsPromiseWithRetryCloseConnection('SET TRANSACTION ISOLATION LEVEL ' + tx, {});
    }
    return null;
  }

  public async forceCloseConnectionForTesting(): Promise<boolean> {
    Logger.warn('Forcing connection closed for testing');
    const conn: DatabaseAccess = await this.getDB();
    try {
      await conn.close();
      Logger.info('Connection has been ended, but not set to null');
      return true;
    } catch (err) {
      Logger.error('Error closing connection : %s', err, err);
      return false;
    }
  }

  private async innerExecutePreparedAsPromiseWithRetryCloseConnection<Row>(
    query: string,
    fields: object = {},
    retryCount = 1
  ): Promise<QueryResults<Row>> {
    try {
      const result: QueryResults<Row> = await this.innerExecutePreparedAsPromise<Row>(query, fields);
      return result;
    } catch (errIn) {
      const err: Error = ErrorRatchet.asErr(errIn);
      if (
        err.message.includes('closed state') ||
        err.message.includes('This socket has been ended by the other party') ||
        err.message.includes('ETIMEDOUT') ||
        err.message.includes('RatchetNoConnection') ||
        err.message.includes('ER_LOCK_WAIT_TIMEOUT')
      ) {
        const wait: number = Math.min(1000 * retryCount);
        Logger.warn(
          'Found closed connection or lock timeout - clearing and attempting retry after %d (try %d of 3) (%s)',
          wait,
          retryCount,
          err.message
        );
        if (retryCount < 4) {
          const cleared: boolean = await this.connectionProvider.clearDatabaseAccessCache();
          Logger.info('Clear connection cache returned %s', cleared);
          await PromiseRatchet.wait(wait);
          return this.innerExecutePreparedAsPromiseWithRetryCloseConnection(query, fields, retryCount + 1);
        } else {
          Logger.warn('Ran out of retries');
          throw new Error('Connection closed and cannot retry any more - dying horribly');
        }
      } else {
        Logger.error('Named Param DB Query Failed : Err: %s Query: %s Params: %j', err, query, fields, err);
        try {
          const conn: DatabaseAccess = await this.getDB();
          Logger.error(
            '-----\nFor paste into tooling only: \n\n%s\n\n',
            QueryUtil.renderQueryStringForPasteIntoTool(query, fields, (v) => conn.escape(v))
          );
        } catch (err2) {
          Logger.error('Really bad - failed trying to get the conn for logging : %s', err2);
        }

        // Just rethrow anything else
        throw err;
      }
    }
  }

  private async innerExecutePreparedAsPromise<Row>(query: string, fields: object = {}): Promise<QueryResults<Row>> {
    const conn: DatabaseAccess = await this.getDB();
    if (conn.preQuery) {
      await conn.preQuery();
    }
    const sw: StopWatch = new StopWatch();

    try {
      const output: QueryResults<Row> = await conn.query<Row>(query, fields);
      // If we reached here we were ok
      Logger.debug('Success : Finished query : %s\n%s\n\nParams : %j', sw.dump(), QueryUtil.reformatQueryForLogging(query), fields);
      Logger.debug(
        '-----\nFor paste into tooling only : \n\n%s\n\n',
        QueryUtil.renderQueryStringForPasteIntoTool(query, fields, (v) => conn.escape(v))
      );
      if (conn.onQuerySuccessOnly) {
        await conn.onQuerySuccessOnly();
      }

      return output;
    } catch(err) {
      if (conn.onQueryFailureOnly) {
        await conn.onQueryFailureOnly();
      }
      throw err;
    } finally {
      if (conn.onQuerySuccessOrFailure) {
        await conn.onQuerySuccessOrFailure();
      }
    }
  }

  // Creates a promise if there isn't already a cached one or if it is closed
  public async getDB(): Promise<DatabaseAccess> {
    const conn: DatabaseAccess | undefined =
      this.nonPooledMode() ? await this.connectionProvider.createNonPooledDatabaseAccess(this.queryDefaults, this.nonPooledExtraConfiguration()) :
      await this.connectionProvider.getDatabaseAccess(this.queryDefaults.databaseName);
    if (!conn) {
      // If we just couldn't connect to the DB
      throw new Error('RatchetNoConnection : getConnection returned null - likely failed to get connection from db');
    }
    return conn;
  }

  public async resetConnection(): Promise<boolean> {
    let rval = false;
    Logger.info('Resetting connection');
    try {
      await this.connectionProvider.clearDatabaseAccessCache();
      const tmpValue = await this.testConnection();
      rval = !!tmpValue;
      Logger.info('Reset connection returning %s', rval);
    } catch (err) {
      Logger.error('Failed to reset connection : %s', err);
    }
    return rval;
  }
}
