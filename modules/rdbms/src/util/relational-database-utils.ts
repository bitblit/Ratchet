import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { TransactionIsolationLevel } from "../model/transaction-isolation-level.js";
import { ModifyResults } from "../model/modify-results.js";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service.js";
import { DatabaseRequestType } from "../model/database-request-type.js";

/**
 * Any useful tools for working with relational databases
 */
export class RelationalDatabaseUtils {
  public static async uploadObjectArrayToTable<Item extends object>(
    db: NamedParameterDatabaseService,
    tableName: string,
    data: Item[],
    clearTableFirst = false
  ): Promise<number> {
    RequireRatchet.notNullOrUndefined(db, 'db');
    RequireRatchet.notNullOrUndefined(tableName, 'tableName');
    RequireRatchet.notNullOrUndefined(data, 'data');
    Logger.info('Writing %d items to %s (clear: %s)', data.length, tableName, clearTableFirst);

    if (clearTableFirst) {
      Logger.info('Clearing table %s', tableName);
      const { results: deleteResult } = await db.executeQueryWithMeta<ModifyResults>(
        DatabaseRequestType.Modify,
        TransactionIsolationLevel.Default,
        'DELETE FROM ' + tableName,
        {}
      );
      Logger.info('Removed %d rows', deleteResult.affectedRows);
    }

    const columns = new Set<string>(data.flatMap((row) => Object.keys(row)));
    const colArr: string[] = Array.from(columns);
    Logger.info('Found columns : %j', colArr);
    const sql: string = 'INSERT INTO ' + tableName + ' (' + colArr.join(',') + ') VALUES :multiValue';

    const { results: insertResult } = await db.executeQueryWithMeta<ModifyResults>(
      DatabaseRequestType.Modify,
      TransactionIsolationLevel.Default, sql, {
      multiValue: data,
    });
    const inserted = insertResult.affectedRows;
    Logger.info('Wrote %d rows', inserted);
    if (inserted !== data.length) {
      Logger.warn('Should have written %d but wrote %d', data.length, inserted);
    }
    return inserted;
  }
}
