// Memory version for testing
import { PrototypeDaoProvider } from "./prototype-dao-provider.js";
import { PrototypeDaoDb } from "./prototype-dao-db.js";

export class MemoryPrototypeDaoProvider implements PrototypeDaoProvider<any> {

  private _db: PrototypeDaoDb<any> = null;


  public async loadDatabase(): Promise<PrototypeDaoDb<any>> {
    return this._db;
  }

  public async storeDatabase(db: PrototypeDaoDb<any>): Promise<boolean> {
    this._db = db;
    return true;
  }

}