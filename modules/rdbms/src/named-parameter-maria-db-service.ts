import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { TimeoutToken } from '@bitblit/ratchet-common/lib/lang/timeout-token.js';
import { PromiseRatchet } from '@bitblit/ratchet-common/lib/lang/promise-ratchet.js';
import { DurationRatchet } from '@bitblit/ratchet-common/lib/lang/duration-ratchet.js';
import { ErrorRatchet } from '@bitblit/ratchet-common/lib/lang/error-ratchet.js';
import { Connection, ConnectionOptions } from 'mysql2/promise';
import { MysqlResultsWrapper } from './model/mysql/mysql-results-wrapper.js';
import { MysqlUpdateResults } from './model/mysql/mysql-update-results.js';
import { StopWatch } from '@bitblit/ratchet-common/lib/lang/stop-watch.js';
import { QueryUtil } from './query-builder/query-util.js';
import { TransactionIsolationLevel } from './model/transaction-isolation-level.js';
import { NonPooledMysqlStyleConnectionProvider } from './non-pooled-mysql-style-connection-provider.js';
import { MysqlStyleConnectionProvider } from './model/mysql/mysql-style-connection-provider.js';
import { QueryBuilder } from './query-builder/query-builder.js';
import { GroupByCountResult } from './model/group-by-count-result.js';
import { QueryDefaults } from './model/query-defaults.js';
import { QueryTextProvider } from './model/query-text-provider.js';

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

export class NamedParameterMariaDbService {
  private static LONG_QUERY_TIME_MS = 8500;

  private serviceName = 'TBD';

  constructor(
    private queryProvider: QueryTextProvider,
    private connectionProvider: MysqlStyleConnectionProvider,
    private queryDefaults: QueryDefaults
  ) {
    this.serviceName = 'NamedParameterMariaDb';
  }

  public getQueryDefaults(): QueryDefaults {
    return this.queryDefaults;
  }

  public getQueryProvider(): QueryTextProvider {
    return this.queryProvider;
  }

  public async createNonPooledMysqlStyleConnectionProvider(
    queryDefaults: QueryDefaults,
    additionalConfig?: ConnectionOptions
  ): Promise<NonPooledMysqlStyleConnectionProvider> {
    Logger.info('createTransactional :  %s : %j', queryDefaults, additionalConfig);
    if (!this.connectionProvider.createNonPooledDatabaseConnection) {
      throw new Error(`Connection provider does not implement createNonPooledDatabaseConnection`);
    }
    const newConn = await this.connectionProvider.createNonPooledDatabaseConnection(queryDefaults, additionalConfig);
    if (!newConn) {
      throw new Error(`Connection could not be created for DB type ${queryDefaults}`);
    }
    return new NonPooledMysqlStyleConnectionProvider(newConn);
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
  ): Promise<MysqlUpdateResults> {
    const builder = this.queryBuilder(queryPath).withParams(params ?? {});
    return this.buildAndExecuteUpdateOrInsert(builder, timeoutMS);
  }

  public async buildAndExecuteUpdateOrInsert(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.queryDefaults.timeoutMS
  ): Promise<MysqlUpdateResults> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<MysqlUpdateResults>(
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
  ): Promise<MysqlUpdateResults> {
    let retry = 0;
    let res: MysqlUpdateResults | undefined;
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
  ): Promise<MysqlResultsWrapper<Row>> {
    const sw: StopWatch = new StopWatch();
    if (!timeoutMS) {
      timeoutMS = this.queryDefaults.timeoutMS;
    }

    await this.changeNextQueryTransactionIsolationLevel(transactionIsolationLevel);

    const result = await PromiseRatchet.timeout<MysqlResultsWrapper<Row>>(
      this.innerExecutePreparedAsPromiseWithRetryCloseConnection<Row>(query, fields, undefined),
      'Query:' + query,
      timeoutMS
    );

    if (TimeoutToken.isTimeoutToken(result)) {
      Logger.warn('Timed out (after %s): %j', DurationRatchet.colonFormatMsDuration(timeoutMS), result);
      const duration = DurationRatchet.colonFormatMsDuration(timeoutMS);
      throw new Error(`Timed out (after ${duration}) waiting for query : ${query}`);
    }
    const rval = result as MysqlResultsWrapper<Row>;
    if (!rval.results) {
      Logger.error('DB:executeQueryWithMeta:Failure: %j', rval);
    }

    if (debugComment && sw.elapsedMS() > NamedParameterMariaDbService.LONG_QUERY_TIME_MS) {
      Logger.info('NamedParameterMariaDbService long query: %s, %s', debugComment, sw.dump());
    }
    return rval;
  }

  public async shutdown(): Promise<boolean> {
    Logger.info('Shutting down %s service', this.serviceName);
    let rval: boolean;
    try {
      rval = await this.connectionProvider.clearConnectionCache();
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
  ): Promise<MysqlResultsWrapper<Row> | null> {
    if (tx && tx !== TransactionIsolationLevel.Default) {
      Logger.debug('Setting tx to %s', tx);
      return await this.innerExecutePreparedAsPromiseWithRetryCloseConnection('SET TRANSACTION ISOLATION LEVEL ' + tx, {});
    }
    return null;
  }

  public async forceCloseConnectionForTesting(): Promise<boolean> {
    Logger.warn('Forcing connection closed for testing');
    const conn: Connection = await this.getDB();
    try {
      await conn.end();
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
  ): Promise<MysqlResultsWrapper<Row>> {
    try {
      const result = await this.innerExecutePreparedAsPromise<Row>(query, fields);
      return result;
    } catch (errIn) {
      const err: Error = ErrorRatchet.asErr(errIn);
      if (
        err.message.includes('closed state') ||
        err.message.includes('This socket has been ended by the other party') ||
        err.message.includes('ETIMEDOUT') ||
        err.message.includes('NeonNoConnection') ||
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
          const cleared: boolean = await this.connectionProvider.clearConnectionCache();
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
          const conn: Connection = await this.getDB();
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

  private async innerExecutePreparedAsPromise<Row>(query: string, fields: object = {}): Promise<MysqlResultsWrapper<Row>> {
    const conn: Connection = await this.getDB();
    conn.config.namedPlaceholders = true;
    const sw: StopWatch = new StopWatch();

    try {
      const [rows, outFields] = await conn.query(query, fields);
      const rval: MysqlResultsWrapper<Row> = {
        results: rows as Row,
        fields: outFields,
      };
      // If we reached here we were ok
      Logger.debug('Success : Finished query : %s\n%s\n\nParams : %j', sw.dump(), QueryUtil.reformatQueryForLogging(query), fields);
      Logger.debug(
        '-----\nFor paste into tooling only : \n\n%s\n\n',
        QueryUtil.renderQueryStringForPasteIntoTool(query, fields, (v) => conn.escape(v))
      );
      return rval;
    } finally {
      conn.config.namedPlaceholders = false;
    }
  }

  // Creates a promise if there isn't already a cached one or if it is closed
  public async getDB(): Promise<Connection> {
    const conn: Connection | undefined = await this.connectionProvider.getConnection(this.queryDefaults.databaseName);
    if (!conn) {
      // If we just couldn't connect to the DB
      throw new Error('NeonNoConnection : getConnection returned null - likely failed to get connection from db');
    }
    return conn;
  }

  public async resetConnection(): Promise<boolean> {
    let rval = false;
    Logger.info('Resetting connection');
    try {
      await this.connectionProvider.clearConnectionCache();
      const tmpValue = await this.testConnection();
      rval = !!tmpValue;
      Logger.info('Reset connection returning %s', rval);
    } catch (err) {
      Logger.error('Failed to reset connection : %s', err);
    }
    return rval;
  }
}
