import { describe, expect, test } from "vitest";
import { SqliteStyleConnectionProvider } from "./sqlite-style-connection-provider";
import * as path from "node:path";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { SimpleQueryTextProvider } from "../model/simple-query-text-provider";
import { ModifyResults } from "../model/modify-results";
import { RequestResults } from "../model/request-results";

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
      queryProvider: new SimpleQueryTextProvider({default:'SELECT * FROM TICKETS WHERE ticket_state IN (:ticketStateList)'}),
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000},
      longQueryTimeMs: 8_500,
    });

    const res: any[] = await ns.buildAndExecute<any>(ns.queryBuilder('default').withParams({ticketStateList: ['New','Complete']}));


    Logger.info('Get: %j', res);

    expect(res).not.toBeNull;
  });
  test('handles apostrophes in multi-value inserts', async () => {
    // Memory database
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(()=>{
      return Promise.resolve({
        dbList: [{
          label: 'test'
        }]
      })
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: new SimpleQueryTextProvider({create:'create table testable (val varchar(255))', singleIns: 'insert into testable (val) values (:val)',
      counter: 'select count(1) as cnt from testable', multi: 'insert into testable (val) values :multiVal'}),
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000},
      longQueryTimeMs: 8_500,
    });

    // Create a table
    const createRes: any = await ns.executeUpdateOrInsertByName('create');

    // Test single
    const singleIns: ModifyResults = await ns.executeUpdateOrInsertByName('singleIns', {val: 'val1'});

    const singleCount: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(singleCount['cnt']).toEqual(1);

    const multiIns: ModifyResults = await ns.executeUpdateOrInsertByName('multi', {multiVal: [['val\'s are 2'],['val3']]});

    const multiCount: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(multiCount['cnt']).toEqual(3);

    const multiIns2: ModifyResults = await ns.executeUpdateOrInsertByName('multi', {multiVal: [['multi\'s apo\'s']]});

    const multiCount2: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(multiCount2['cnt']).toEqual(4);

    Logger.info('Get: %j', singleCount);
  }, 30_000);
});
