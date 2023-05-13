import {
  CreateTableCommand,
  CreateTableCommandInput,
  CreateTableCommandOutput,
  DeleteTableCommand,
  DeleteTableCommandInput,
  DeleteTableCommandOutput,
  DescribeTableCommand,
  DescribeTableCommandOutput,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { ErrorRatchet, Logger, PromiseRatchet, RequireRatchet } from '@bitblit/ratchet-common';

export class DynamoTableRatchet {
  constructor(private awsDDB: DynamoDBClient) {
    if (!awsDDB) {
      throw 'awsDDB may not be null';
    }
  }

  public async deleteTable(tableName: string, waitForDelete = true): Promise<DeleteTableCommandOutput> {
    RequireRatchet.notNullOrUndefined(tableName);
    const input: DeleteTableCommandInput = {
      TableName: tableName,
    };
    Logger.debug('Deleting ddb table %s', tableName);
    const rval: DeleteTableCommandOutput = await this.awsDDB.send(new DeleteTableCommand(input));

    if (waitForDelete) {
      Logger.debug('Table marked for delete, waiting for deletion');
      await this.waitForTableDelete(tableName);
    }

    return rval;
  }

  public async createTable(
    input: CreateTableCommandInput,
    waitForReady = true,
    replaceIfExists = false
  ): Promise<CreateTableCommandOutput> {
    RequireRatchet.notNullOrUndefined(input);
    RequireRatchet.notNullOrUndefined(input.TableName);

    Logger.debug('Creating new table : %j', input);
    const exists: boolean = await this.tableExists(input.TableName);

    if (exists) {
      if (replaceIfExists) {
        Logger.debug('Table %s exists and replace specified - deleting', input.TableName);
        await this.deleteTable(input.TableName);
      } else {
        ErrorRatchet.throwFormattedErr('Cannot create table %s - exists already and replace not specified', input.TableName);
      }
    }

    const rval: CreateTableCommandOutput = await this.awsDDB.send(new CreateTableCommand(input));

    if (waitForReady) {
      Logger.debug('Table created, awaiting ready');
      await this.waitForTableReady(input.TableName);
    }

    return rval;
  }

  public async waitForTableReady(tableName: string): Promise<boolean> {
    let rval = true;
    let out: DescribeTableCommandOutput = await this.safeDescribeTable(tableName);

    while (!!out && !!out.Table && out.Table.TableStatus !== 'ACTIVE') {
      Logger.silly('Table not ready - waiting 2 seconds');
      await PromiseRatchet.wait(2000);
      out = await this.safeDescribeTable(tableName);
    }

    if (!out && !out.Table) {
      Logger.warn('Cannot wait for %s to be ready - table does not exist', tableName);
      rval = false;
    }

    return rval;
  }

  public async waitForTableDelete(tableName: string): Promise<void> {
    let out: DescribeTableCommandOutput = await this.safeDescribeTable(tableName);

    while (!!out) {
      Logger.silly('Table %s still exists, waiting 2 seconds (State is %s)', tableName, out.Table.TableStatus);
      await PromiseRatchet.wait(2000);
      out = await this.safeDescribeTable(tableName);
    }
  }

  public async tableExists(tableName: string): Promise<boolean> {
    const desc: DescribeTableCommandOutput = await this.safeDescribeTable(tableName);
    return !!desc;
  }

  public async safeDescribeTable(tableName: string): Promise<DescribeTableCommandOutput> {
    try {
      const out: DescribeTableCommandOutput = await this.awsDDB.send(new DescribeTableCommand({ TableName: tableName }));
      return out;
    } catch (err) {
      if (!!err['code'] && err['code'] === 'ResourceNotFoundException') {
        return null;
      } else {
        throw err;
      }
    }
  }
}
