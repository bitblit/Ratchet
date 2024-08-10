import {
  AttributeDefinition,
  CreateTableCommand,
  CreateTableCommandInput,
  CreateTableCommandOutput,
  DeleteTableCommand,
  DeleteTableCommandInput,
  DeleteTableCommandOutput,
  DescribeTableCommand,
  DescribeTableCommandOutput,
  DynamoDBClient,
  GlobalSecondaryIndex,
  GlobalSecondaryIndexDescription,
  KeySchemaElement,
  ListTablesCommand,
  ListTablesCommandInput,
  ListTablesCommandOutput,
  ProvisionedThroughput,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { LocalSecondaryIndex } from '@aws-sdk/client-dynamodb/dist-types/models/models_0.js';
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { PromiseRatchet } from "@bitblit/ratchet-common/lang/promise-ratchet";

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
    replaceIfExists = false,
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

    while (out) {
      Logger.silly('Table %s still exists, waiting 2 seconds (State is %s)', tableName, out.Table.TableStatus);
      await PromiseRatchet.wait(2000);
      out = await this.safeDescribeTable(tableName);
    }
  }

  public async tableExists(tableName: string): Promise<boolean> {
    const desc: DescribeTableCommandOutput = await this.safeDescribeTable(tableName);
    return !!desc;
  }

  public async listAllTables(): Promise<string[]> {
    const input: ListTablesCommandInput = {};
    let rval: string[] = [];

    do {
      const out: ListTablesCommandOutput = await this.awsDDB.send(new ListTablesCommand(input));
      rval = rval.concat(out.TableNames);
      input.ExclusiveStartTableName = out.LastEvaluatedTableName;
    } while (input.ExclusiveStartTableName);
    return rval;
  }

  public async safeDescribeTable(tableName: string): Promise<DescribeTableCommandOutput> {
    try {
      const out: DescribeTableCommandOutput = await this.awsDDB.send(new DescribeTableCommand({ TableName: tableName }));
      return out;
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        return null;
      } else {
        throw err;
      }
    }
  }

  public async copyTable(
    srcTableName: string,
    dstTableName: string,
    overrides?: CreateTableCommandInput,
    copyData?: boolean,
  ): Promise<CreateTableCommandOutput> {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(srcTableName, 'srcTableName');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(dstTableName, 'dstTableName');
    if (copyData) {
      throw ErrorRatchet.fErr('Cannot copy %s to %s - copy data not supported yet', srcTableName, dstTableName);
    }
    const srcTableDef: DescribeTableCommandOutput = await this.safeDescribeTable(srcTableName);
    if (await this.tableExists(dstTableName)) {
      throw ErrorRatchet.fErr('Cannot copy to %s - table already exists', dstTableName);
    }
    if (!srcTableDef) {
      throw ErrorRatchet.fErr('Cannot copy %s - doesnt exist', srcTableName);
    }

    const ads: AttributeDefinition[] = srcTableDef.Table.AttributeDefinitions;
    const ks: KeySchemaElement[] = srcTableDef.Table.KeySchema;
    const gi: GlobalSecondaryIndexDescription[] = srcTableDef.Table.GlobalSecondaryIndexes;

    const createInput: CreateTableCommandInput = Object.assign({}, overrides || {}, {
      AttributeDefinitions: srcTableDef.Table.AttributeDefinitions,
      TableName: dstTableName,
      KeySchema: srcTableDef.Table.KeySchema,
      LocalSecondaryIndexes: srcTableDef.Table.LocalSecondaryIndexes as LocalSecondaryIndex[],
      GlobalSecondaryIndexes: srcTableDef.Table.GlobalSecondaryIndexes.map((gi) => {
        const output: GlobalSecondaryIndex = gi as GlobalSecondaryIndex;
        if (output.ProvisionedThroughput?.WriteCapacityUnits === 0 || output.ProvisionedThroughput?.ReadCapacityUnits === 0) {
          output.ProvisionedThroughput = undefined;
        }
        return output;
      }),
      BillingMode: srcTableDef.Table.BillingModeSummary.BillingMode,
      ProvisionedThroughput:
        srcTableDef.Table.BillingModeSummary.BillingMode === 'PROVISIONED'
          ? (srcTableDef.Table.ProvisionedThroughput as ProvisionedThroughput)
          : undefined,
      StreamSpecification: srcTableDef.Table.StreamSpecification,
      SSESpecification: srcTableDef.Table.SSEDescription,
      Tags: undefined,
      TableClass: srcTableDef.Table.TableClassSummary?.TableClass,
      DeletionProtectionEnabled: srcTableDef.Table.DeletionProtectionEnabled,
    });

    const rval: CreateTableCommandOutput = await this.awsDDB.send(new CreateTableCommand(createInput));

    return rval;
  }
}
