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
import { WardenTeamRoleMapping } from "@bitblit/ratchet-warden-common/common/model/warden-team-role-mapping";
import { WardenEntryMetadata } from "@bitblit/ratchet-warden-common/common/model/warden-entry-metadata";


// Create a ddb table with a hashkey of userId type string
export class WardenDynamoStorageProvider<T> implements WardenStorageProvider, ExpiringCodeProvider {

  private static readonly EXPIRING_CODE_PROVIDER_KEY: string = '__EXPIRING_CODE_DATA';

  constructor(
    private ddb: DynamoRatchet,
    private options: WardenDynamoStorageProviderOptions<T>
  ) {
  }

  public async updateRoles(userId: string, roles: WardenTeamRoleMapping[]): Promise<WardenEntry> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    if (rval) {
      rval.entry.teamRoleMappings = roles;
      await this.updateInternal(rval);
    } else {
      throw ErrorRatchet.fErr('Cannot update roles - no entry found for %s', userId);
    }

    return this.findEntryById(userId);
  }


  public async updateMetaData(userId: string, meta: WardenEntryMetadata): Promise<WardenEntry> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    if (rval) {
      rval.entry.meta = (rval.entry.meta||[]).filter(s=>s.key!==meta.key);
      rval.entry.meta.push(meta);
      await this.updateInternal(rval);
    } else {
      throw ErrorRatchet.fErr('Cannot update roles - no entry found for %s', userId);
    }

    return this.findEntryById(userId);
  }

  public async removeMetaData(userId: string, metaKey: string): Promise<WardenEntry> {
    const rval: WardenDynamoStorageDataWrapper = await this.fetchInternalByUserId(userId);
    if (rval) {
      rval.entry.meta = (rval.entry.meta||[]).filter(s=>s.key!==metaKey);
      await this.updateInternal(rval);
    } else {
      throw ErrorRatchet.fErr('Cannot update roles - no entry found for %s', userId);
    }

    return this.findEntryById(userId);
  }


  // Sure, this is hackish... but DDB doesn't care, and it allows you to wrap up all the
  // warden data in a single item
  private async fetchExpiringCodes(): Promise<ExpiringCodeHolder> {
    let rval: ExpiringCodeHolder = await this.ddb.simpleGet<ExpiringCodeHolder>(this.options.tableName, {
      userId: WardenDynamoStorageProvider.EXPIRING_CODE_PROVIDER_KEY
    });

    if (!rval) {
      rval = {
        userId: WardenDynamoStorageProvider.EXPIRING_CODE_PROVIDER_KEY,
        values: []
      };
      await this.updateInternal(rval as unknown as WardenDynamoStorageDataWrapper);  // Hack to piggyback
    }

    return rval;
  }

  private async updateInternal(val: WardenDynamoStorageDataWrapper): Promise<PutCommandOutput> {
    return this.ddb.simplePut(this.options.tableName, val);
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const codes: ExpiringCodeHolder = await this.fetchExpiringCodes();
    const rval: ExpiringCode = codes.values.find((c) => c.code === code && c.context === context);
    if (rval) {
      if (deleteOnMatch) {
        codes.values = codes.values.filter((c) => c.code !== code || c.context !== context);
        await this.updateInternal(codes as unknown as WardenDynamoStorageDataWrapper);  // Hack to piggyback
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
    const stored: PutCommandOutput = await this.updateInternal(codes as unknown as WardenDynamoStorageDataWrapper);  // Hack to piggyback

    return stored ? true : false;
  }

  private static contactToSearchString(contact: WardenContact): string {
    const toFind: string = `${contact.type}:${contact.value}`;
    return toFind;
  }

  private static thirdPartyToSearchString(thirdParty: string, thirdPartyId: string): string {
    const toFind: string = `${thirdParty}:${thirdPartyId}`;
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



  public async findEntryByThirdPartyId(thirdParty: string, thirdPartyId: string): Promise<WardenEntry> {
    const toFind: string = WardenDynamoStorageProvider.thirdPartyToSearchString(thirdParty, thirdPartyId);
    const scan: ScanCommandInput = {
      TableName: this.options.tableName,
      FilterExpression: 'contains(#thirdPartySearchString,:thirdPartySearchString)',
      ExpressionAttributeNames: {
        '#thirdPartySearchString': 'thirdPartySearchString',
      },
      ExpressionAttributeValues: {
        ':thirdPartySearchString': toFind
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
    const rval: WardenEntrySummary[] = results.filter(dsw=>dsw.userId!==WardenDynamoStorageProvider.EXPIRING_CODE_PROVIDER_KEY)
      .map(wd=>{
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
        contactSearchString: 'ContactSearch:  '+(entry.contactMethods || []).map((cm) => WardenDynamoStorageProvider.contactToSearchString(cm)).join(' '),
        thirdPartySearchString: '3rdPartySearch:  '+(entry.thirdPartyAuthenticators || []).map((item) => WardenDynamoStorageProvider.thirdPartyToSearchString(item.thirdParty, item.thirdPartyId)).join(' '),
      };
    }
    rval.entry = entry;
    const now: number = Date.now();
    rval.entry.updatedEpochMS = now;
    rval.entry.createdEpochMS = rval.entry.createdEpochMS || now;
    const saved: PutCommandOutput = await this.updateInternal(rval);
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

    const saved: PutCommandOutput = await this.updateInternal(rval);
    Logger.silly('Saved %j', saved);
    return saved.Attributes ? true : false;
  }


}

export interface WardenDynamoStorageDataWrapper {
  userId: string;
  entry: WardenEntry;
  currentUserChallenges: string[];
  contactSearchString: string;
  thirdPartySearchString: string;
}

export interface ExpiringCodeHolder {
  userId: string;
  values: ExpiringCode[];
}