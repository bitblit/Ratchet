import { NamedParameterDatabaseService } from "./named-parameter-database-service";
import { ConnectionOptions } from "mysql2/promise";
import { ErrorRatchet, Logger, StringRatchet } from "@bitblit/ratchet-common";
import { QueryBuilder } from "../query-builder/query-builder.js";
import { QueryDefaults } from "../model/query-defaults.js";
import { QueryTextProvider } from "../model/query-text-provider.js";
import { ModifyResults } from "../model/modify-results";
import { DatabaseAccessProvider } from "../model/database-access-provider";

/**
 * Extends NamedParameterDatabaseService to add transactional functionality
 *
 * Typical usage would look like:
 *
 * (assume db is a NamedParameterDatabaseService)
 * const tx: TransactionalNamedParameterDatabaseService = await TransactionalNamedParameterDatabaseService.create(db);
 * const result: ModifyResults = await tx.buildAndExecuteUpdateOrInsertInTransaction(queryBuilder);
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

export class TransactionalNamedParameterDatabaseService extends NamedParameterDatabaseService {
  private currentTxFlag?: string;

  constructor(
    private myQueryProvider: QueryTextProvider,
    private myConnectionProvider: DatabaseAccessProvider,
    private myQueryDefaults: QueryDefaults,
    private additionalConfig: Record<string,any>
  ) {
    super(myQueryProvider, myConnectionProvider, myQueryDefaults);
  }

  public nonPooledExtraConfiguration(): Record<string,any> {
    return this.additionalConfig;
  }

  public nonPooledMode(): boolean {
    return true;
  }

  public async cleanShutdown(): Promise<void> {
    Logger.info('cleanShutdown');
    try {
      const conn = await this.myConnectionProvider.getDatabaseAccess();
      if (conn) {
        Logger.info('Shutting down connection');
        await conn.close();
      }
    } catch (err) {
      Logger.info('Failure shutting down single-use connection : %s', err);
    }
  }

  public async startTransaction(): Promise<void> {
    if (!this.currentTxFlag) {
      this.currentTxFlag = StringRatchet.createRandomHexString(10);
      Logger.info('Starting a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getDatabaseAccess();
      await conn?.beginTransaction();
    } else {
      ErrorRatchet.throwFormattedErr('Tried to start a new transaction while one is already in progress : %s', this.currentTxFlag);
    }
  }

  public async commitTransaction(): Promise<void> {
    if (this.currentTxFlag) {
      Logger.info('commit a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getDatabaseAccess();
      await conn?.commitTransaction();
      this.currentTxFlag = undefined;
    } else {
      ErrorRatchet.throwFormattedErr('Cannot commit transaction - none in process');
    }
  }

  public async rollBackTransaction(): Promise<void> {
    if (this.currentTxFlag) {
      Logger.info('rollBack a transaction : %s', this.currentTxFlag);
      const conn = await this.myConnectionProvider.getDatabaseAccess();
      await conn?.rollbackTransaction();
      this.currentTxFlag = undefined;
    } else {
      ErrorRatchet.throwFormattedErr('Cannot rollBack transaction - none in process');
    }
  }

  public async buildAndExecuteUpdateOrInsertInTransaction(
    queryBuilder: QueryBuilder,
    timeoutMS: number = this.myQueryDefaults.timeoutMS
  ): Promise<ModifyResults | null> {
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
    src: NamedParameterDatabaseService,
    queryBuilder: QueryBuilder,
    timeoutMS: number = src.getQueryDefaults().timeoutMS,
    additionalConfig?: Record<string,any>
  ): Promise<ModifyResults | null> {
    let handler: TransactionalNamedParameterDatabaseService | undefined;
    let rval: ModifyResults | null = null;
    try {
      handler = new TransactionalNamedParameterDatabaseService(src.getQueryProvider(), src.databaseAccessProvider, src.getQueryDefaults(), additionalConfig);
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

  public static async oneStepBuildAndExecuteInTransaction<S,T,R>(
    src: NamedParameterDatabaseService,
    queryBuilder: QueryBuilder,
    timeoutMS: number = src.getQueryDefaults().timeoutMS,
    additionalConfig?: R
  ): Promise<S[] | null> {
    let handler: TransactionalNamedParameterDatabaseService | undefined;
    let rval: S[] | null = null;
    try {
      handler = new TransactionalNamedParameterDatabaseService(src.getQueryProvider(), src.databaseAccessProvider, src.getQueryDefaults(), additionalConfig);
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
