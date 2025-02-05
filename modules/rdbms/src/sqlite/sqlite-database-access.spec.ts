import { describe, expect, test } from 'vitest';
import { SqliteStyleConnectionProvider } from './sqlite-style-connection-provider.js';
import { NamedParameterDatabaseService } from '../service/named-parameter-database-service.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { SimpleQueryTextProvider } from '../model/simple-query-text-provider.js';
import { ModifyResults } from '../model/modify-results.js';
import { RequestResults } from '../model/request-results.js';
import fs from 'fs';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import path from 'path';

describe('sqlite-database-access', () => {
  const testQueries: SimpleQueryTextProvider = new SimpleQueryTextProvider({
    create: 'create table testable (val varchar(255))',
    singleIns: 'insert into testable (val) values (:val)',
    csvIns: 'insert into testable (val) values (:valCsv)',
    counter: 'select count(1) as cnt from testable',
    multi: 'insert into testable (val) values :multiVal',
  });

  test.skip('builds filtered', async () => {
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(() => {
      const pth: string = path.resolve(path.join(process.env['SQLITE_HOME'], 'ratchet-test.db'));
      if (!fs.existsSync(pth)) {
        throw ErrorRatchet.fErr('Cannot find file %s', pth);
      }

      return Promise.resolve({
        dbList: [
          {
            label: 'test',
            localFile: {
              filePath: pth,
            },
          },
        ],
      });
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: new SimpleQueryTextProvider({ default: 'SELECT * FROM TICKETS WHERE ticket_state IN (:ticketStateList)' }),
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
      longQueryTimeMs: 8_500,
    });

    const res: any[] = await ns.buildAndExecute<any>(ns.queryBuilder('default').withParams({ ticketStateList: ['New', 'Complete'] }));

    Logger.info('Get: %j', res);

    expect(res).not.toBeNull;
  });

  test.skip('runs test query', async () => {
    // Memory database
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(() => {
      return Promise.resolve({
        dbList: [
          {
            label: 'test',
          },
        ],
      });
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: testQueries,
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
      longQueryTimeMs: 8_500,
    });
    const val: any = await ns.testConnection(true);
    Logger.info('Val was : %j', val);
  });

  test('handles path with sub', async () => {
    // Memory database
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(() => {
      return Promise.resolve({
        dbList: [
          {
            label: 'test',
          },
        ],
      });
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: testQueries,
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
      longQueryTimeMs: 8_500,
    });

    // Create a table
    const _createRes: any = await ns.executeUpdateOrInsertByName('create');

    const myOb: Record<string, any> = {
      val: ['t1', 't2'],
    };

    // Test insert
    const singleIns: ModifyResults = await ns.buildAndExecuteUpdateOrInsert(
      ns.queryBuilder('csvIns').withParams(myOb).withParam('valCsv', myOb['val'].join(',')),
    );
    expect(singleIns.affectedRows).toBeGreaterThan(0);

    const singleCount: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(singleCount['cnt']).toEqual(1);

    Logger.info('Get: %j', singleCount);
  }, 30_000);

  test('handles apostrophes in multi-value inserts', async () => {
    // Memory database
    const prov: SqliteStyleConnectionProvider = new SqliteStyleConnectionProvider(() => {
      return Promise.resolve({
        dbList: [
          {
            label: 'test',
          },
        ],
      });
    });
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: testQueries,
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
      longQueryTimeMs: 8_500,
    });

    // Create a table
    const _createRes: any = await ns.executeUpdateOrInsertByName('create');

    // Test single
    const _singleIns: ModifyResults = await ns.executeUpdateOrInsertByName('singleIns', { val: 'val1' });

    const singleCount: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(singleCount['cnt']).toEqual(1);

    const _multiIns: ModifyResults = await ns.executeUpdateOrInsertByName('multi', { multiVal: [["val's are 2"], ['val3']] });

    const multiCount: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(multiCount['cnt']).toEqual(3);

    const _multiIns2: ModifyResults = await ns.executeUpdateOrInsertByName('multi', { multiVal: [["multi's apo's"]] });

    const multiCount2: RequestResults<any> = await ns.executeQueryByNameSingle('counter', {});

    expect(multiCount2['cnt']).toEqual(4);

    Logger.info('Get: %j', singleCount);
  }, 30_000);
});
