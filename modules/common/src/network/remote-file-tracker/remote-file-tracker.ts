import { RemoteStatusData } from "./remote-status-data.js";
import { RemoteStatusDataAndContent } from "./remote-status-data-and-content.js";
import { FileTransferResultType } from "./file-transfer-result-type.js";
import { FileTransferResult } from "./file-transfer-result.js";
import { Logger } from "../../logger/logger.js";
import { RemoteFileTrackerOptions } from "./remote-file-tracker-options.js";
import { RequireRatchet } from "../../lang/require-ratchet.js";
import { RemoteFileTrackerPushOptions } from "./remote-file-tracker-push-options.js";
import { WebStreamRatchet } from "../../lang/web-stream-ratchet";

export class RemoteFileTracker<KeyType> {
  // Updated every type you sync or pull
  private _remoteStatusData: RemoteStatusData<KeyType>;

  constructor(private opts: RemoteFileTrackerOptions<KeyType>) {
    RequireRatchet.notNullOrUndefined(opts, 'opts');
    RequireRatchet.notNullOrUndefined(opts.provider, 'opts.provider');
    RequireRatchet.notNullOrUndefined(opts.key, 'opts.key');
  }

  public get remoteStatusData(): RemoteStatusData<KeyType> {
    // Gen a copy to prevent accidental corruption
    return Object.assign({},this._remoteStatusData);
  }

  // Rereads the remote side
  public async sync(): Promise<RemoteStatusData<KeyType>> {
    this._remoteStatusData = await this.opts.provider.readRemoteStatus(this.opts.key);
    return this._remoteStatusData;
  }

  public async pullRemoteData(ifNewerThan?: RemoteStatusData<KeyType>): Promise<RemoteStatusDataAndContent<KeyType>> {
    const rval: RemoteStatusDataAndContent<KeyType> = await this.opts.provider.pullRemoteData(this.opts.key, ifNewerThan);
    if (rval) {
      this._remoteStatusData = rval.status;
    }
    return rval;
  }

  public static async dataAsString(data: RemoteStatusDataAndContent<any>): Promise<string> {
    let rval: string = null;
    if (data?.content) {
      rval = await WebStreamRatchet.webReadableStreamToString(data.content);
    }
    return rval;
  }

  public static async dataAsUint8Array(data: RemoteStatusDataAndContent<any>): Promise<Uint8Array> {
    let rval: Uint8Array = null;
    if (data?.content) {
      rval = await WebStreamRatchet.webReadableStreamToUint8Array(data.content);
    }
    return rval;
  }

  public static async dataAsObject<T>(data: RemoteStatusDataAndContent<any>): Promise<T> {
    let rval: T = null;
    if (data?.content) {
      const txt: string = await this.dataAsString(data);
      rval = JSON.parse(txt);
    }
    return rval;
  }

  // Will throw exception if remote was modified since the last update
  public async pushStreamToRemote(src: ReadableStream, inPushOpts?: RemoteFileTrackerPushOptions): Promise<RemoteStatusData<KeyType>> {
    RequireRatchet.notNullOrUndefined(src, 'src');
    const pushOpts: RemoteFileTrackerPushOptions = Object.assign({force: false, backup: false}, inPushOpts);
    const result: FileTransferResult = await this.opts.provider.sendDataToRemote(src, this.opts.key, pushOpts, this._remoteStatusData);
    if (result.type === FileTransferResultType.Updated) {
      Logger.info('Sent %d bytes to remote, re-reading sync');
      await this.sync();
    }
    return this._remoteStatusData;
  }

  public async pushStringToRemote(src: string, inPushOpts?: RemoteFileTrackerPushOptions): Promise<RemoteStatusData<KeyType>> {
    RequireRatchet.notNullOrUndefined(src, 'src');
    const asString: ReadableStream = WebStreamRatchet.stringToWebReadableStream(src);
    return this.pushStreamToRemote(asString);
  }

  public async pushUint8ArrayToRemote(src: Uint8Array, inPushOpts?: RemoteFileTrackerPushOptions): Promise<RemoteStatusData<KeyType>> {
    RequireRatchet.notNullOrUndefined(src, 'src');
    const asString: ReadableStream = WebStreamRatchet.uint8ArrayToWebReadableStream(src);
    return this.pushStreamToRemote(asString);
  }

  public async pushObjectJsonToRemote(src: any, inPushOpts?: RemoteFileTrackerPushOptions): Promise<RemoteStatusData<KeyType>> {
    RequireRatchet.notNullOrUndefined(src, 'src');
    const asString: string = JSON.stringify(src);
    return this.pushStringToRemote(asString);
  }

  // If skipUpdateLocal is NOT set, the next call will succeed because
  // the data is updated as part of the read
  public async modifiedSinceLastSync(skipUpdateLocal?: boolean): Promise<boolean> {
    const newData: RemoteStatusData<KeyType> = await this.opts.provider.readRemoteStatus(this.opts.key);
    const rval: boolean = !RemoteFileTracker.statusMatch(newData, this._remoteStatusData);
    if (!skipUpdateLocal) {
      this._remoteStatusData = newData;
    }
    return rval;
  }

  public static statusMatch(rsd1: RemoteStatusData<any>, rsd2: RemoteStatusData<any>): boolean {
    return rsd1 && rsd2 && rsd1.remoteHash===rsd2.remoteHash && rsd1.remoteSizeInBytes === rsd2.remoteSizeInBytes
    && rsd1.remoteLastUpdatedEpochMs === rsd2.remoteLastUpdatedEpochMs;
  }

}