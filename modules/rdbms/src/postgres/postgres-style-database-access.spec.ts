import { describe, test } from "vitest";
import { NamedParameterDatabaseService } from "../service/named-parameter-database-service.js";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { SimpleQueryTextProvider } from "../model/simple-query-text-provider.js";
import { PostgresStyleConnectionProvider } from "./postgres-style-connection-provider";
import { DatabaseConfigList } from "../model/database-config-list";
import { PostgresDbConfig } from "./model/postgres-db-config";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { ModifyResults } from "../model/modify-results";

describe('postgres-style-database-access', () => {
  const testQueries: SimpleQueryTextProvider = new SimpleQueryTextProvider({
    create: 'create table testable (id SERIAL PRIMARY KEY, val varchar(255))',
    fetchWithParam: 'select * from testable where val = :val',
    singleIns: 'insert into testable (val) values (:val) RETURNING id',
    singleDelete: 'delete from testable where val=:val',
    csvIns: 'insert into testable (val) values (:valCsv)',
    counter: 'select count(1) as cnt from testable',
    multi: 'insert into testable (val) values :multiVal',
    multiSelect: 'select * from testable',
  });

  test('runs test query', async () => {
    const ratchetPostgresTestDatabaseConnectionString = StringRatchet.trimToNull(process.env['RATCHET_POSTGRES_TEST_DATABASE_CONNECT_STRING']);
    if (ratchetPostgresTestDatabaseConnectionString) {
      const cfgProvider = async () =>{
        const rval: DatabaseConfigList<PostgresDbConfig> = {
          dbList: [
            {
              label: 'test',
              sshTunnelConfig: null,
              dbConfig: {
                connectionString: ratchetPostgresTestDatabaseConnectionString,
                ssl: { rejectUnauthorized: false }
              }
            }
          ]
        };
        return rval;
      };

      // Memory database
      const prov: PostgresStyleConnectionProvider = new PostgresStyleConnectionProvider(cfgProvider);
      const ns: NamedParameterDatabaseService = new NamedParameterDatabaseService({
        serviceName: 'Test',
        queryProvider: testQueries,
        connectionProvider: prov,
        queryDefaults: { databaseName: 'test', timeoutMS: 20_000 },
        longQueryTimeMs: 8_500,
      });
      const testConnVal: any = await ns.testConnection(true);
      Logger.info('TestConnection returned : %j', testConnVal);
      let selectCounter: any = await ns.executeQueryByNameSingle('counter');
      Logger.info('selectCounter returned : %j', selectCounter);
      const multiSelect: any[] = await ns.executeQueryByName('multiSelect');
      Logger.info('multiSelect returned : %j', multiSelect);
      const testVal: string = 'TestValue:'+Date.now();
      const insert: ModifyResults = await ns.executeUpdateOrInsertByName('singleIns', {val: testVal});
      Logger.info('insert returned : %j', insert);
      selectCounter = await ns.executeQueryByNameSingle('counter');
      Logger.info('selectCounter returned : %j', selectCounter);

      const fetch: any = await ns.executeQueryByNameSingle('fetchWithParam', {val: testVal});
      Logger.info('fetch returned : %j', fetch);


      const del: ModifyResults = await ns.executeUpdateOrInsertByName('singleDelete', {val: testVal});
      Logger.info('del returned : %j', del);
      selectCounter = await ns.executeQueryByNameSingle('counter');
      Logger.info('selectCounter returned : %j', selectCounter);

    } else {
      Logger.info('Skipping - no connection string found')
    }
  }, 30_000);
});
