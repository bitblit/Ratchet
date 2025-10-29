import { DatabaseAccessProvider } from "../model/database-access-provider.js";
import { DatabaseAccess } from "../model/database-access.js";
import { QueryDefaults } from "../model/query-defaults.ts";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { RdsDataApiConnectionConfig } from "./model/rds-data-api-connection-config.ts";
import { RdsDataApiDatabaseAccess } from "./rds-data-api-database-access.ts";
import { DatabaseConfigList } from "../model/database-config-list.ts";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";

/**
 */
export class RdsDataApiConnectionProvider implements DatabaseAccessProvider {

  constructor(
    private client: RDSDataClient,
    private configPromiseProvider: () => Promise<DatabaseConfigList<RdsDataApiConnectionConfig>>,
  ) {}

  public async getDatabaseAccess(name?: string): Promise<DatabaseAccess | undefined> {
    const configs: DatabaseConfigList<RdsDataApiConnectionConfig> = await this.configPromiseProvider();
    let cfg: RdsDataApiConnectionConfig = null;
    if (name) {
      cfg = configs.dbList.find(s=>s.label===name);
    } else if (configs.dbList.length===1) {
      cfg = configs.dbList[0];
    } else {
      throw ErrorRatchet.fErr('Database Access not found for name, or no entries found');
    }
    return new RdsDataApiDatabaseAccess(this.client, cfg);
  }

  public async clearDatabaseAccessCache(): Promise<boolean> {
    return true; // We don't really cache these
  }

  public async createNonPooledDatabaseAccess(queryDefaults: QueryDefaults): Promise<DatabaseAccess | undefined> {
    return this.getDatabaseAccess(queryDefaults.databaseName);
  }
}
