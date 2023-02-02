//    Service for interacting with positions for a given user
import { WardenContactEntry } from '../model/warden-contact-entry';
import { WardenStorageProvider } from './warden-storage-provider';
import { WardenS3SingleFileStorageProviderOptions } from './warden-s3-single-file-storage-provider-options';
import { S3CacheRatchet } from '../../aws';
import { WardenEntry } from '../model/warden-entry';
import { StringRatchet } from '../../common/string-ratchet';
import { PutObjectOutput } from 'aws-sdk/clients/s3';

/*
The most quick and dirty implementation of the storage provider.  Not a good choice if you have
multiple users, etc, since it has no synchronization, etc.  Only really useful for very low traffic
websites, or getting a demo hacked out quickly
 */
export class WardenS3SingleFileStorageProvider implements WardenStorageProvider {
  private ratchet: S3CacheRatchet;
  constructor(private s3: AWS.S3, private options: WardenS3SingleFileStorageProviderOptions) {
    this.ratchet = new S3CacheRatchet(this.s3, this.options.bucket);
  }

  public async fetchDataFile(): Promise<WardenS3SingleFileStorageProviderDataFile> {
    let data: WardenS3SingleFileStorageProviderDataFile =
      await this.ratchet.readCacheFileToObject<WardenS3SingleFileStorageProviderDataFile>(this.options.dataFileKey);
    data = data || {
      entries: [],
      challenges: [],
    };
    return data;
  }

  public async storeDataFile(file: WardenS3SingleFileStorageProviderDataFile): Promise<PutObjectOutput> {
    let rval: PutObjectOutput = null;
    if (file) {
      rval = await this.ratchet.writeObjectToCacheFile(this.options.dataFileKey, file);
    }
    return rval;
  }

  public async fetchCurrentUserChallenge(userId: string, relyingPartyId: string): Promise<string> {
    const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
    const entry: WardenS3SingleFileStorageProviderChallengeRecord = (data.challenges || []).find(
      (d) => d.userId === userId && d.relyingPartyId === relyingPartyId
    );
    return entry ? entry.challenge : null;
  }

  public async findEntryByContact(contact: WardenContactEntry): Promise<WardenEntry> {
    let rval: WardenEntry = null;
    if (contact?.type && StringRatchet.trimToNull(contact?.value)) {
      const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
      rval = (data.entries || []).find((d) => !!(d.contactMethods || []).find((x) => x.type === contact.type && x.value === contact.value));
    }
    return rval;
  }

  public async findEntryById(userId: string): Promise<WardenEntry> {
    let rval: WardenEntry = null;
    if (StringRatchet.trimToNull(userId)) {
      const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
      rval = (data.entries || []).find((d) => d.userId === userId);
    }
    return rval;
  }

  public async removeEntry(userId: string): Promise<boolean> {
    const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
    data.entries = (data.entries || []).filter((d) => d.userId !== userId);
    await this.storeDataFile(data);
    return true;
  }

  public async saveEntry(entry: WardenEntry): Promise<WardenEntry> {
    let rval: WardenEntry = null;
    if (entry && entry.userId) {
      const now: number = Date.now();
      entry.createdEpochMS = entry.createdEpochMS || now;
      entry.updatedEpochMS = now;
      const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
      data.entries = (data.entries || []).filter((d) => d.userId !== entry.userId);
      data.entries.push(entry);
      await this.storeDataFile(data);
      rval = await this.findEntryById(entry.userId);
    }
    return rval;
  }

  public async updateUserChallenge(userId: string, relyingPartyId: string, challenge: string): Promise<boolean> {
    const data: WardenS3SingleFileStorageProviderDataFile = await this.fetchDataFile();
    data.challenges = (data.challenges || []).filter((d) => d.userId !== userId || d.relyingPartyId !== relyingPartyId);
    data.challenges.push({
      userId: userId,
      relyingPartyId: relyingPartyId,
      challenge: challenge,
      updatedEpochMS: Date.now(),
    });
    return true;
  }
}

export interface WardenS3SingleFileStorageProviderChallengeRecord {
  userId: string;
  relyingPartyId: string;
  challenge: string;
  updatedEpochMS: number;
}

export interface WardenS3SingleFileStorageProviderDataFile {
  entries: WardenEntry[];
  challenges: WardenS3SingleFileStorageProviderChallengeRecord[];
}
