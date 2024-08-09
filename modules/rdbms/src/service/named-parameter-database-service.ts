import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { PromiseRatchet } from "@bitblit/ratchet-common/lang/promise-ratchet";
import { StopWatch } from "@bitblit/ratchet-common/lang/stop-watch";
import { TimeoutToken } from "@bitblit/ratchet-common/lang/timeout-token";
import { DurationRatchet } from "@bitblit/ratchet-common/lang/duration-ratchet";
import { QueryUtil } from "../query-builder/query-util.js";
import { TransactionIsolationLevel } from "../model/transaction-isolation-level.js";
import { QueryBuilder } from "../query-builder/query-builder.js";
import { GroupByCountResult } from "../model/group-by-count-result.js";
import { QueryDefaults } from "../model/query-defaults.js";
import { QueryTextProvider } from "../model/query-text-provider.js";
import { ModifyResults } from "../model/modify-results.js";
import { DatabaseAccessProvider } from "../model/database-access-provider.js";
import { DatabaseAccess } from "../model/database-access.js";
import { RequestResults } from "../model/request-results.js";
import { DatabaseRequestType } from "../model/database-request-type.js";
import { NamedParameterDatabaseServiceConfig } from "../model/named-parameter-database-service-config.js";

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

  constructor(
    private cfg: NamedParameterDatabaseServiceConfig
  ) {
    cfg.serviceName = cfg.serviceName ?? 'NamedParameterDatabaseService';
    cfg.logger = cfg.logger || Logger.getLogger();
    Logger.info('NamedParameterDatabaseService using logger %s at %s', cfg.logger.guid, cfg.logger.level);
  }

  public getConfig(): NamedParameterDatabaseServiceConfig {
    return this.cfg;
  }

  public nonPooledExtraConfiguration(): Record<string,any> {
    return null;
  }

  public nonPooledMode(): boolean {
    return false;
  }

  public get databaseAccessProvider(): DatabaseAccessProvider {
    return this.cfg.connectionProvider;
  }


  public getQueryDefaults(): QueryDefaults {
    return this.cfg.queryDefaults;
  }

  public getQueryProvider(): QueryTextProvider {
    return this.cfg.queryProvider;
  }

  public async createNonPooledDatabaseAccess(
    queryDefaults: QueryDefaults,
    additionalConfig?: Record<string,any>
  ): Promise<DatabaseAccess> {
    this.cfg.logger.info('createTransactional :  %s : %j', queryDefaults, additionalConfig);
    if (!this.cfg.connectionProvider.createNonPooledDatabaseAccess) {
      throw new Error(`Connection provider does not implement createNonPooledDatabaseAccess`);
    }
    const newConn: DatabaseAccess = await this.cfg.connectionProvider.createNonPooledDatabaseAccess(queryDefaults, additionalConfig);
    if (!newConn) {
      throw new Error(`Connection could not be created for DB type ${queryDefaults}`);
    }
    return newConn;
  }

  public fetchQueryRawTextByName(queryPath: string): string {
    return this.cfg.queryProvider.fetchQuery(queryPath);
  }

  public queryBuilder(queryPath?: string): QueryBuilder {
    const queryBuilder = new QueryBuilder(this.cfg.queryProvider);
    if (queryPath) {
      queryBuilder.withNamedQuery(queryPath);
    }
    return queryBuilder;
  }

  public async executeUpdateOrInsertByName(
    queryPath: string,
    params?: object,
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<ModifyResults> {
    const builder = this.queryBuilder(queryPath).withParams(params ?? {});
    return this.buildAndExecuteUpdateOrInsert(builder, timeoutMS);
  }

  public async buildAndExecuteUpdateOrInsert(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<ModifyResults> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<ModifyResults>(
      DatabaseRequestType.Modify,
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
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<ModifyResults> {
    let retry = 0;
    let res: ModifyResults | undefined;
    while (!res && retry < maxRetries) {
      retry++;
      try {
        res = await this.buildAndExecuteUpdateOrInsert(queryBuilder, timeoutMS);
      } catch (err) {
        this.cfg.logger.info('Caught problem while trying to update/insert : %d : %s ', retry, err);
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
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<Row[]> {
    const builder = this.queryBuilder(queryPath).withParams(params);
    const resp: Row[] = await this.buildAndExecute(builder, timeoutMS);
    return resp;
  }

  public async executeQueryByNameSingle<Row>(
    queryPath: string,
    params: object,
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<Row | null> {
    const builder = this.queryBuilder(queryPath).withParams(params);
    const resp = await this.buildAndExecute<Row>(builder, timeoutMS);
    return resp.length === 1 ? resp[0] : null;
  }

  public async buildAndExecute<Row>(queryBuilder: QueryBuilder, timeoutMS: number = this.cfg.queryDefaults.timeoutMS): Promise<Row[]> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<Row[]>(
      DatabaseRequestType.Query,
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
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<Row | null> {
    const build = queryBuilder.build();
    const resp = await this.executeQueryWithMeta<Row[]>(
      DatabaseRequestType.Query,
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
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS
  ): Promise<GroupByCountResult[]> {
    const buildUnfiltered = queryBuilder.buildUnfiltered();
    let query = buildUnfiltered.query.replace('COUNT(*)', `${groupBy} as groupByField, COUNT(*) as count`);
    query = `${query} GROUP BY ${groupBy}`;

    this.cfg.logger.info('Unfiltered query %s', buildUnfiltered.query);
    const resp = await this.executeQueryWithMeta<GroupByCountResult[]>(
      DatabaseRequestType.Query,
      buildUnfiltered.transactionIsolationLevel,
      query,
      buildUnfiltered.namedParams,
      timeoutMS
    );

    return resp.results;
  }

  public async executeQueryWithMeta<Row>(
    requestType: DatabaseRequestType,
    transactionIsolationLevel: TransactionIsolationLevel,
    query: string,
    fields: object = {},
    timeoutMS: number = this.cfg.queryDefaults.timeoutMS,
    debugComment?: string
  ): Promise<RequestResults<Row>> {
    const sw: StopWatch = new StopWatch();
    if (!timeoutMS) {
      timeoutMS = this.cfg.queryDefaults.timeoutMS;
    }

    await this.changeNextQueryTransactionIsolationLevel(transactionIsolationLevel);

    const result = await PromiseRatchet.timeout<RequestResults<Row>>(
      this.innerExecutePreparedAsPromiseWithRetryCloseConnection<Row>(requestType, query, fields, undefined),
      'Query:' + query,
      timeoutMS
    );

    if (TimeoutToken.isTimeoutToken(result)) {
      this.cfg.logger.warn('Timed out (after %s): %j', DurationRatchet.colonFormatMsDuration(timeoutMS), result);
      const duration = DurationRatchet.colonFormatMsDuration(timeoutMS);
      throw new Error(`Timed out (after ${duration}) waiting for query : ${query}`);
    }
    const rval = result as RequestResults<Row>;
    if (!rval.results) {
      this.cfg.logger.error('DB:executeQueryWithMeta:Failure: %j', rval);
    }

    if (debugComment && sw.elapsedMS() > this.cfg.longQueryTimeMs) {
      this.cfg.logger.info('NamedParameterDatabaseService long query: %s, %s', debugComment, sw.dump());
    }
    return rval;
  }

  public async shutdown(): Promise<boolean> {
    this.cfg.logger.info('Shutting down %s service', this.cfg.serviceName);
    let rval: boolean;
    try {
      rval = await this.cfg.connectionProvider.clearDatabaseAccessCache();
    } catch (err) {
      this.cfg.logger.error('Failure trying to shutdown : %s', err, err);
      rval = false;
    }
    return rval;
  }

  public async testDbFailure(): Promise<void> {
    // This just executes a query guaranteed to fail to generate a db query failure
    await this.executeQueryWithMeta(DatabaseRequestType.Query,TransactionIsolationLevel.Default, 'this is a bad query');
  }

  public async changeNextQueryTransactionIsolationLevel<Row>(
    tx: TransactionIsolationLevel | null
  ): Promise<RequestResults<Row> | null> {
    if (tx && tx !== TransactionIsolationLevel.Default) {
      this.cfg.logger.debug('Setting tx to %s', tx);
      return await this.innerExecutePreparedAsPromiseWithRetryCloseConnection(DatabaseRequestType.Meta, 'SET TRANSACTION ISOLATION LEVEL ' + tx, {});
    }
    return null;
  }

  public async forceCloseConnectionForTesting(): Promise<boolean> {
    this.cfg.logger.warn('Forcing connection closed for testing');
    const conn: DatabaseAccess = await this.getDB();
    try {
      await conn.close();
      this.cfg.logger.info('Connection has been ended, but not set to null');
      return true;
    } catch (err) {
      this.cfg.logger.error('Error closing connection : %s', err, err);
      return false;
    }
  }

  private async innerExecutePreparedAsPromiseWithRetryCloseConnection<Row>(
    requestType: DatabaseRequestType,
    query: string,
    fields: object = {},
    retryCount = 1
  ): Promise<RequestResults<Row>> {
    try {
      const result: RequestResults<Row> = await this.innerExecutePreparedAsPromise<Row>(requestType, query, fields);
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
        this.cfg.logger.warn(
          'Found closed connection or lock timeout - clearing and attempting retry after %d (try %d of 3) (%s)',
          wait,
          retryCount,
          err.message
        );
        if (retryCount < 4) {
          const cleared: boolean = await this.cfg.connectionProvider.clearDatabaseAccessCache();
          this.cfg.logger.info('Clear connection cache returned %s', cleared);
          await PromiseRatchet.wait(wait);
          return this.innerExecutePreparedAsPromiseWithRetryCloseConnection(requestType, query, fields, retryCount + 1);
        } else {
          this.cfg.logger.warn('Ran out of retries');
          throw new Error('Connection closed and cannot retry any more - dying horribly');
        }
      } else {
        this.cfg.logger.error('Named Param DB Query Failed : Err: %s Query: %s Params: %j', err, query, fields, err);
        try {
          const conn: DatabaseAccess = await this.getDB();
          this.cfg.logger.error(
            '-----\nFor paste into tooling only: \n\n%s\n\n',
            QueryUtil.renderQueryStringForPasteIntoTool(query, fields, (v) => conn.escape(v))
          );
        } catch (err2) {
          this.cfg.logger.error('Really bad - failed trying to get the conn for logging : %s', err2);
        }

        // Just rethrow anything else
        throw err;
      }
    }
  }

  private async innerExecutePreparedAsPromise<Row>(requestType: DatabaseRequestType, query: string, fields: object = {}): Promise<RequestResults<Row>> {
    const conn: DatabaseAccess = await this.getDB();
    if (conn.preQuery) {
      await conn.preQuery();
    }
    const sw: StopWatch = new StopWatch();

    try {
      let output: RequestResults<Row | ModifyResults>;
      if (requestType===DatabaseRequestType.Modify) {
        this.cfg.logger.debug('Executing modify on underlying db : %s / %j', query, fields);
        output = await conn.modify(query, fields);
      } else {
        this.cfg.logger.debug('Executing query on underlying db : %s / %j', query, fields);
        output = await conn.query<Row>(query, fields);
      }
      // If we reached here we were ok
      this.cfg.logger.debug('Success : Finished query : %s\n%s\n\nParams : %j', sw.dump(), QueryUtil.reformatQueryForLogging(query), fields);
      this.cfg.logger.debug(
        '-----\nFor paste into tooling only : \n\n%s\n\n',
        QueryUtil.renderQueryStringForPasteIntoTool(query, fields, (v) => conn.escape(v))
      );
      if (conn.onRequestSuccessOnly) {
        await conn.onRequestSuccessOnly(requestType);
      }

      return output as RequestResults<Row>;
    } catch(err) {
      if (conn.onRequestFailureOnly) {
        await conn.onRequestFailureOnly(requestType);
      }
      throw err;
    } finally {
      if (conn.onRequestSuccessOrFailure) {
        await conn.onRequestSuccessOrFailure(requestType);
      }
    }
  }

  // Creates a promise if there isn't already a cached one or if it is closed
  public async getDB(): Promise<DatabaseAccess> {
    const conn: DatabaseAccess | undefined =
      this.nonPooledMode() ? await this.cfg.connectionProvider.createNonPooledDatabaseAccess(this.cfg.queryDefaults, this.nonPooledExtraConfiguration()) :
      await this.cfg.connectionProvider.getDatabaseAccess(this.cfg.queryDefaults.databaseName);
    if (!conn) {
      // If we just couldn't connect to the DB
      throw new Error('RatchetNoConnection : getConnection returned null - likely failed to get connection from db');
    }
    return conn;
  }

  public async testConnection(logTestResults?: boolean): Promise<number> {
    const db: DatabaseAccess = await this.getDB();
    return db.testConnection(logTestResults);
  }

  public async resetConnection(): Promise<boolean> {
    let rval = false;
    this.cfg.logger.info('Resetting connection');
    try {
      await this.cfg.connectionProvider.clearDatabaseAccessCache();
      const db: DatabaseAccess = await this.getDB();
      const tmpValue = await db.testConnection(true);
      rval = !!tmpValue;
      this.cfg.logger.info('Reset connection returning %s', rval);
    } catch (err) {
      this.cfg.logger.error('Failed to reset connection : %s', err);
    }
    return rval;
  }
}
