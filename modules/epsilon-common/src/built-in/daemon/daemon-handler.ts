import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { DaemonProcessState } from '@bitblit/ratchet-aws-node-only/daemon/daemon-process-state';
import { DaemonLike } from '@bitblit/ratchet-aws-node-only/daemon/daemon-like';
import { DaemonAuthorizerFunction } from './daemon-authorizer-function.js';
import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';
import { NotFoundError } from '../../http/error/not-found-error.js';
import { DaemonProcessStateList } from './daemon-process-state-list.js';
import { DaemonConfig } from './daemon-config.js';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

/**
 * A helper class to simplify adding Ratchet "Daemon" handling to your application
 */
export class DaemonHandler {
  public static readonly ALLOW_EVERYTHING_AUTHORIZER: DaemonAuthorizerFunction = async (
    _evt: ExtendedAPIGatewayEvent,
    _proc: DaemonProcessState,
  ) => {
    return true;
  };
  private config: DaemonConfig;
  //private groupSelectionFunction: DaemonGroupSelectionFunction;
  //private authorizer: DaemonAuthorizerFunction;

  /**
   * Initialize the Router
   */
  constructor(
    private daemon: DaemonLike,
    private inConfig?: DaemonConfig,
  ) {
    this.config = inConfig || {};
    this.config.authorizer = this.config.authorizer || DaemonHandler.ALLOW_EVERYTHING_AUTHORIZER;
    this.config.groupSelector = this.config.groupSelector || ((_evt: ExtendedAPIGatewayEvent) => Promise.resolve(daemon.defaultGroup));
    this.config.fetchDaemonStatusByPublicTokenPathParameter =
      StringRatchet.trimToNull(this.config.fetchDaemonStatusByPublicTokenPathParameter) || 'publicToken';
    this.config.fetchDaemonStatusPathParameter = StringRatchet.trimToNull(this.config.fetchDaemonStatusPathParameter) || 'key';
  }

  // If you are going to map this function, be sure that your Daemon is setup with a JwtRatchet...
  public async fetchDaemonStatusByPublicToken(evt: ExtendedAPIGatewayEvent): Promise<DaemonProcessState> {
    // TODO: verify has access to this key
    const publicToken: string = evt.pathParameters[this.config.fetchDaemonStatusByPublicTokenPathParameter];
    Logger.info('Fetching daemon status for token: %s', publicToken);

    let rval: DaemonProcessState = await this.daemon.statFromPublicToken(publicToken);
    const canRead: boolean = rval ? await this.config.authorizer(evt, rval) : false;
    rval = canRead ? rval : null;
    if (rval === null) {
      throw new NotFoundError('No such token : ' + publicToken);
    }
    return rval;
  }

  public async fetchDaemonStatus(evt: ExtendedAPIGatewayEvent): Promise<DaemonProcessState> {
    // TODO: verify has access to this key
    const daemonKey: string = evt.pathParameters[this.config.fetchDaemonStatusPathParameter];
    Logger.info('Fetching daemon status for : %s', daemonKey);

    let rval: DaemonProcessState = await this.daemon.stat(daemonKey);
    const canRead: boolean = rval ? await this.config.authorizer(evt, rval) : false;
    rval = canRead ? rval : null;
    if (rval === null) {
      throw new NotFoundError('No such key : ' + daemonKey);
    }
    return rval;
  }

  public async listDaemonStatus(evt: ExtendedAPIGatewayEvent): Promise<DaemonProcessStateList> {
    const group: string = await this.config.groupSelector(evt);
    const keys: DaemonProcessState[] = await this.daemon.list(group);
    const allowed: DaemonProcessState[] = [];
    for (const kVal of keys) {
      //for (let i = 0; i < keys.length; i++) {
      const canRead: boolean = await this.config.authorizer(evt, kVal);
      if (canRead) {
        allowed.push(kVal);
      }
    }
    // Token here for future expansion into pagination, not implemented yet
    const rval: DaemonProcessStateList = {
      results: allowed,
      nextToken: null,
    };
    return rval;
  }
}
