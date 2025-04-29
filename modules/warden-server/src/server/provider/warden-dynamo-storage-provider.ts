import { DynamoRatchet } from '@bitblit/ratchet-aws/dynamodb/dynamo-ratchet';
import { WardenDynamoStorageProviderOptions } from './warden-dynamo-storage-provider-options.js';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { WardenEntry } from '@bitblit/ratchet-warden-common/common/model/warden-entry';
import { WardenEntrySummary } from '@bitblit/ratchet-warden-common/common/model/warden-entry-summary';
import { DeleteCommandOutput, PutCommandOutput,ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { WardenUtils } from '@bitblit/ratchet-warden-common/common/util/warden-utils';
import { ExpiringCodeProvider } from '@bitblit/ratchet-aws/expiring-code/expiring-code-provider';
import { ExpiringCode } from '@bitblit/ratchet-aws/expiring-code/expiring-code';
import { WardenStorageProvider } from "./warden-storage-provider.js";

export class WardenDynamoStorageProvider implements WardenStorageProvider, ExpiringCodeProvider {

  private static readonly EXPIRING_CODE_PROVIDER_KEY: string = '__EXPIRING_CODE_DATA';

  constructor(
    private ddb: DynamoRatchet,
    private options: WardenDynamoStorageProviderOptions
  ) {
  }

  private async fetchExpiringCodes(): Promise<ExpiringCodeHolder> {
    let rval: ExpiringCodeHolder = await this.ddb.simpleGet<ExpiringCodeHolder>(this.options.tableName, {
      userId: WardenDynamoStorageProvider.EXPIRING_CODE_PROVIDER_KEY
    });

    if (!rval) {
      rval = {
        userId: WardenDynamoStorageProvider.EXPIRING_CODE_PROVIDER_KEY,
        values: []
      };
      await this.ddb.simplePut(this.options.tableName, rval);
    }

    return rval;
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const codes: ExpiringCodeHolder = await this.fetchExpiringCodes();
    const rval: ExpiringCode = codes.values.find((c) => c.code === code && c.context === context);
    if (rval) {
      if (deleteOnMatch) {
        codes.values = codes.values.filter((c) => c.code !== code || c.context !== context);
        await this.ddb.simplePut(this.options.tableName, codes);
      }
      return true;
    } else {
      return !!rval;
    }
  }

  public async storeCode(code: ExpiringCode): Promise<boolean> {
    const codes: ExpiringCodeHolder = await this.fetchExpiringCodes();
    codes.values.push(code);
    const now: number = Date.now();
    codes.values=codes.values.filter(c=>c.expiresEpochMS>now); // Always remove expired ones on storage
    const stored: PutCommandOutput = await this.ddb.simplePut(this.options.tableName, codes);

    return stored ? true : false;
  }

  private static contactToSearchString(contact: WardenContact): string {
    const toFind: string = `${contact.type}:${contact.value}`;
    return toFind;
  }

  private async fetchInternalByUserId(userId: string): Promise<WardenDynamoStorageDataWrapper> {
    return this.ddb.simpleGet<WardenDynamoStorageDataWrapper>(this.options.tableName, {userId: userId});
  }

  public async fetchCurrentUserChallenge(userId: string, relyingPartyId: string): Promise<string> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    const cuc: string = rval ? rval.currentUserChallenges.find((c) => c.startsWith(relyingPartyId)) : null;
    return cuc ? cuc.substring(relyingPartyId.length+1) : null;
  }

  public async findEntryByContact(contact: WardenContact): Promise<WardenEntry> {
    const toFind: string = WardenDynamoStorageProvider.contactToSearchString(contact);
    const scan: ScanCommandInput = {
      TableName: this.options.tableName,
      FilterExpression: 'contains(#contactSearchString,:contactSearchString)',
      ExpressionAttributeNames: {
        '#contactSearchString': 'contactSearchString',
      },
      ExpressionAttributeValues: {
        ':contactSearchString': toFind
      }
    };

    const results: WardenDynamoStorageDataWrapper[] = await this.ddb.fullyExecuteScan<WardenDynamoStorageDataWrapper>(scan);
    if (results && results.length > 0) {
      const rval: WardenDynamoStorageDataWrapper = results[0];
      return rval.entry;
    } else {
      Logger.info('No results found for %s', toFind);
      return null;
    }

  }

  public async findEntryById(userId: string): Promise<WardenEntry> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    return rval ? rval.entry : null;
  }

  public async listUserSummaries(): Promise<WardenEntrySummary[]> {
    // TODO: This is way too slow long term
    const scan: ScanCommandInput = {
      TableName: this.options.tableName,
    };

    const results: WardenDynamoStorageDataWrapper[] = await this.ddb.fullyExecuteScan<WardenDynamoStorageDataWrapper>(scan);
    const rval: WardenEntrySummary[] = results.map(wd=>{
      return WardenUtils.stripWardenEntryToSummary(wd.entry);
    })
    return rval;
  }

  public async removeEntry(userId: string): Promise<boolean> {
    const tmp: DeleteCommandOutput = await this.ddb.simpleDelete(this.options.tableName, {userId: userId});
    return tmp.Attributes ? true : false;
  }

  public async saveEntry(entry: WardenEntry): Promise<WardenEntry> {
    let rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(entry.userId);
    if (!rval) {
      rval = {
        userId: entry.userId,
        entry: entry,
        currentUserChallenges: [],
        contactSearchString: (entry.contactMethods || []).map((cm) => WardenDynamoStorageProvider.contactToSearchString(cm)).join(' '),
      };
    }
    rval.entry = entry;
    const now: number = Date.now();
    rval.entry.updatedEpochMS = now;
    rval.entry.createdEpochMS = rval.entry.createdEpochMS || now;
    const saved: PutCommandOutput = await this.ddb.simplePut(this.options.tableName, rval);
    Logger.silly('Saved %j', saved);

    const postSaveLookup: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(entry.userId);
    return postSaveLookup.entry;
  }

  public async updateUserChallenge(userId: string, relyingPartyId: string, challenge: string): Promise<boolean> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    if (!rval) {
      throw ErrorRatchet.fErr('Cannot update user challenge - no entry found for %s', userId);
    }
    rval.currentUserChallenges = (rval.currentUserChallenges || []).filter((c) => !c.startsWith(relyingPartyId));
    const cuc: string = relyingPartyId + ':' + challenge;
    rval.currentUserChallenges.push(cuc);

    const saved: PutCommandOutput = await this.ddb.simplePut(this.options.tableName, rval);
    Logger.silly('Saved %j', saved);
    return saved.Attributes ? true : false;
  }


}

export interface WardenDynamoStorageDataWrapper {
  userId: string;
  entry: WardenEntry;
  currentUserChallenges: string[];
  contactSearchString: string;
}

export interface ExpiringCodeHolder {
  userId: string;
  values: ExpiringCode[];
}