import { describe, expect, test } from "vitest";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service.js";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { SimpleQueryTextProvider } from "../model/simple-query-text-provider.js";
import { ModifyResults } from "../model/modify-results.js";
import { RequestResults } from "../model/request-results.js";
import { RdsDataApiConnectionProvider } from "./rds-data-api-connection-provider";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

async function buildProvider():Promise<RdsDataApiConnectionProvider> {
  const rdsClient: RDSDataClient = new RDSDataClient({region: 'us-east-2'});
  const prov: RdsDataApiConnectionProvider = new RdsDataApiConnectionProvider(rdsClient, () => {
    return Promise.resolve({
      dbList: [
        {
          label: 'test',
          resourceArn: 'test',
          secretArn: 'test',
          database: 'test'
        },
      ],
    });
  });
  return prov;
}

describe('rds-data-api-database-access', () => {
  const testQueries: SimpleQueryTextProvider = new SimpleQueryTextProvider({
    create: 'create table testable (val varchar(255))',
    singleIns: 'insert into testable (val) values (:val)',
    csvIns: 'insert into testable (val) values (:valCsv)',
    counter: 'select count(1) as cnt from testable',
    multi: 'insert into testable (val) values :multiVal',
  });


  test.skip('builds filtered', async () => {
    //process.env['AWS_PROFILE']='test';
    const prov: RdsDataApiConnectionProvider = await buildProvider();
    const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
      serviceName: 'Test',
      queryProvider: new SimpleQueryTextProvider({ default: 'select mfa_required, email from people where email=:email' }),
      connectionProvider: prov,
      queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
      longQueryTimeMs: 8_500,
    });

    const res: any[] = await ns.buildAndExecute<any>(ns.queryBuilder('default').withParams({ email: 'rachel@viggo.team' }));

    Logger.info('Get: %j', res);

    expect(res).not.toBeNull;
  }, 25_000);

  test.skip('runs test query', async () => {
    try {
      //process.env['AWS_PROFILE']='test';
      const prov: RdsDataApiConnectionProvider = await buildProvider();
      const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
        serviceName: 'Test',
        queryProvider: testQueries,
        connectionProvider: prov,
        queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
        longQueryTimeMs: 8_500,
      });
      const val: any = await ns.testConnection(true);
      Logger.info('Val was : %j', val);
    } catch (err) {
      Logger.error('Test failed',err);
    }
  }, 25_000);

  test.skip('handles path with sub', async () => {
    //process.env['AWS_PROFILE']='test';
    const prov: RdsDataApiConnectionProvider = await buildProvider();
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

  test.skip('handles apostrophes in multi-value inserts', async () => {
    const prov: RdsDataApiConnectionProvider = await buildProvider();
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
