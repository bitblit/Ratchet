import { Injectable } from '@angular/core';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { No } from '@bitblit/ratchet-common/lang/no';
import { Router } from '@angular/router';
import { WardenUserServiceEventProcessingProvider } from '@bitblit/ratchet-warden-common/client/provider/warden-user-service-event-processing-provider';
import { WardenLoggedInUserWrapper } from '@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { WardenClient } from '@bitblit/ratchet-warden-common/client/warden-client';

@Injectable({ providedIn: 'root' })
export class WardenAdapterService implements WardenUserServiceEventProcessingProvider<any> {
  constructor(
    public router: Router,
    public wardenClient: WardenClient,
  ) {}

  public onAutomaticLogout(): void {
    // Make sure we leave
    this.router.navigate(['/public/login']).then(No.op);
  }

  public onAutomaticTokenRefresh(_refreshUser: WardenLoggedInUserWrapper): void {
    Logger.info('User token refreshed');
  }

  public onLoginFailure(reason: string): void {
    Logger.info('Failed to login: %s', reason);
  }

  public onLogout(): void {
    // Make sure we leave
    this.router.navigate(['/public/login']).then(No.op);
  }

  public onSuccessfulLogin(newUser: WardenLoggedInUserWrapper): void {
    Logger.info('Logged in as %s', newUser?.userObject?.user.userLabel);
  }

  public async sendMagicLink(contact: WardenContact, magicLanderUrl: string, postLoginUrl?: string): Promise<void> {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(magicLanderUrl, 'magicLanderUrl may not be empty');

    const mUrl: URL = new URL(magicLanderUrl);
    const param: URLSearchParams = new URLSearchParams(mUrl.search);
    if (!param.has('code')) {
      param.set('code', '{CODE}');
    }
    if (!param.has('meta')) {
      param.set('meta', '{META}');
    }

    mUrl.search = param.toString();

    /*
    let curUrl: string = loc.toString();
    curUrl = curUrl.indexOf('?') > -1 ? curUrl.substring(0, curUrl.indexOf('?')) : curUrl;
    let landingUrl: string = curUrl.split('public/login').join('public/magic-lander');
    landingUrl += '?code={CODE}&meta={META}';
     */
    const meta: Record<string, string> = {
      redirect: postLoginUrl,
    };
    const sent: boolean = await this.wardenClient.sendMagicLink(contact, mUrl.toString(), meta);

    Logger.info('Sent was %s : %s', sent, mUrl.toString());
  }
}
