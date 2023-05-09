import { NamedParameterMariaDbService } from './named-parameter-maria-db-service.js';
import { MysqlStyleConnectionProvider } from './model/mysql/mysql-style-connection-provider.js';
import { ConnectionOptions } from 'mysql2/promise';
import { ErrorRatchet } from '@bitblit/ratchet-common/lib/lang/error-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { StringRatchet } from '@bitblit/ratchet-common/lib/lang/string-ratchet.js';
import { QueryBuilder } from './query-builder/query-builder.js';
import { NonPooledMysqlStyleConnectionProvider } from './non-pooled-mysql-style-connection-provider.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lib/lang/require-ratchet.js';
import { MysqlUpdateResults } from './model/mysql/mysql-update-results.js';
import { QueryDefaults } from './model/query-defaults.js';
import { QueryTextProvider } from './model/query-text-provider.js';

/**
 * Extends NamedParameterMariaDbService to add transactional functionality
 *
 * Typical usage would look like:
 *
 * (assume db is a NamedParameterMariaDbService)
 * const tx: TransactionalNamedParameterMariaDbService = await TransactionalNamedParameterMariaDbService.create(db);
 * const result: MysqlUpdateResults = await tx.buildAndExecuteUpdateOrInsertInTransaction(queryBuilder);
 * ...
 * (best practice is to clean-up the connection after)
 * await tx.cleanShutdown();
 *
 * If the user needs to execute multiple statements, they can by calling
 * startTransaction
 * exec
 * exec
 * commit/rollback
 * --
 * manually
 *
 * (Then the cleanShutdown)
 */

export class TransactionalNamedParameterMariaDbService extends NamedParameterMariaDbService {
  private currentTxFlag?: string;

  // CAW 2022-07-01 : Have to wire it up this kinda weird way to avoid a circular import with NamedParameterMariaDbService
  public static async create(
    src: NamedParameterMariaDbService,
    queryDefaults: QueryDefaults,
    additionalConfig?: ConnectionOptions
  ): Promise<TransactionalNamedParameterMariaDbService> {
    Logger.info('createTransactionalNamedParameterMariaDbService :  %j : %j', queryDefaults, additionalConfig);
    const connProv: NonPooledMysqlStyleConnectionProvider = await src.createNonPooledMysqlStyleConnectionProvider(
      queryDefaults,
      additionalConfig
    );
    return new TransactionalNamedParameterMariaDbService(src.getQueryProvider(), connProv, queryDefaults);
  }

  constructor(
    private myQueryProvider: QueryTextProvider,
    private myConnectionProvider: MysqlStyleConnectionProvider,
    private myQueryDefaults: QueryDefaults
  ) {
    super(myQueryProvider, myConnectionProvider, myQueryDefaults);
  }

  public async cleanShutdown(): Promise<void> {
    Logger.info('cleanShutdown');
    try {
      const conn = await this.myConnectionProvider.getConnection();
      if (conn) {
        Logger.info('Shutting down connection');
        conn.destroy();
      }
    } catch (err) {
      Logger.info('Failure shutting down single-use connection : %s', err);
    }
  }

  public async startTransaction(): Promise<void> {
    if (!this.currentTxFlag) {
      this.currentTxFlag = StringRatchet.createRandomHexString(10);
      Logger.info('Starting a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getConnection();
      await conn?.beginTransaction();
    } else {
      ErrorRatchet.throwFormattedErr('Tried to start a new transaction while one is already in progress : %s', this.currentTxFlag);
    }
  }

  public async commitTransaction(): Promise<void> {
    if (this.currentTxFlag) {
      Logger.info('commit a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getConnection();
      await conn?.commit();
      this.currentTxFlag = undefined;
    } else {
      ErrorRatchet.throwFormattedErr('Cannot commit transaction - none in process');
    }
  }

  public async rollBackTransaction(): Promise<void> {
    if (this.currentTxFlag) {
      Logger.info('rollBack a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getConnection();
      await conn?.rollback();
      this.currentTxFlag = undefined;
    } else {
      ErrorRatchet.throwFormattedErr('Cannot rollBack transaction - none in process');
    }
  }

  public async buildAndExecuteUpdateOrInsertInTransaction(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.myQueryDefaults.timeoutMS
  ): Promise<MysqlUpdateResults | null> {
    Logger.info('buildAndExecuteUpdateOrInsertInTransaction');
    await this.startTransaction();
    try {
      const rval = await this.buildAndExecuteUpdateOrInsert(queryBuilder, timeoutMS);
      await this.commitTransaction();
      return rval;
    } catch (err) {
      Logger.error('Failed - rolling back transaction : %s', err, err);
      await this.rollBackTransaction();
      return null;
    }
  }

  public async buildAndExecuteInTransaction<T>(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.myQueryDefaults.timeoutMS
  ): Promise<T[] | null> {
    Logger.info('buildAndExecuteInTransaction');
    await this.startTransaction();
    try {
      const rval = await this.buildAndExecute<T>(queryBuilder, timeoutMS);
      await this.commitTransaction();
      return rval;
    } catch (err) {
      Logger.error('Failed - rolling back transaction : %s', err, err);
      await this.rollBackTransaction();
      return null;
    }
  }

  public static async oneStepBuildAndExecuteUpdateOrInsertInTransaction(
    src: NamedParameterMariaDbService,
    queryBuilder: QueryBuilder,
    timeoutMS: number = src.getQueryDefaults().timeoutMS,
    additionalConfig?: ConnectionOptions
  ): Promise<MysqlUpdateResults | null> {
    let handler: TransactionalNamedParameterMariaDbService | undefined;
    let rval: MysqlUpdateResults | null = null;
    try {
      handler = await TransactionalNamedParameterMariaDbService.create(src, src.getQueryDefaults(), additionalConfig);
      rval = await handler.buildAndExecuteUpdateOrInsertInTransaction(queryBuilder, timeoutMS);
    } catch (err) {
      Logger.error('Failure in oneStepBuildAndExecuteUpdateOrInsertInTransaction : %j : %s', queryBuilder, err, err);
    } finally {
      if (handler) {
        await handler.cleanShutdown();
      }
    }
    return rval;
  }

  public static async oneStepBuildAndExecuteInTransaction<T>(
    src: NamedParameterMariaDbService,
    queryBuilder: QueryBuilder,
    timeoutMS: number = src.getQueryDefaults().timeoutMS,
    additionalConfig?: ConnectionOptions
  ): Promise<T[] | null> {
    let handler: TransactionalNamedParameterMariaDbService | undefined;
    let rval: T[] | null = null;
    try {
      handler = await TransactionalNamedParameterMariaDbService.create(src, src.getQueryDefaults(), additionalConfig);
      rval = await handler.buildAndExecuteInTransaction(queryBuilder, timeoutMS);
    } catch (err) {
      Logger.error('Failure in oneStepbuildAndExecuteInTransaction : %j : %s', queryBuilder, err, err);
    } finally {
      if (handler) {
        await handler.cleanShutdown();
      }
    }
    return rval;
  }
}
