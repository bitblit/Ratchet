import { describe, expect, test } from "vitest";
import { SqliteStyleConnectionProvider } from "./sqlite-style-connection-provider";
import * as path from "node:path";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service";
import { RequestResults } from "../model/request-results";
import { Logger } from "@bitblit/ratchet-common";
import { TestingQueryTextProvider } from "../model/testing-query-text-provider";

describe('sqlite-database-access', () => {
  test.skip('builds filtered', async () => {
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(()=>{
      return Promise.resolve({
        dbList: [{
          label: 'test',
          filePath: path.join(process.env['SQLITE_HOME'],'ratchet-test.db')
        }]
      })
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: new TestingQueryTextProvider('SELECT * FROM TICKETS WHERE ticket_state IN (:ticketStateList)'),
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000},
      longQueryTimeMs: 8_500,
    });

    const res: RequestResults<any[]> = await ns.buildAndExecute(ns.queryBuilder('default').withParams({ticketStateList: ['New','Complete']}));


    Logger.info('Get: %j', res);

    expect(res).not.toBeNull;
  });
});
