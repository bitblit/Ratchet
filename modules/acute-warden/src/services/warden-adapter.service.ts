import {Injectable} from '@angular/core';
import {Logger} from '@bitblit/ratchet-common/logger/logger';
import {No} from "@bitblit/ratchet-common/lang/no";
import {Router} from '@angular/router';
import { WardenUserServiceEventProcessingProvider } from '@bitblit/ratchet-warden-common/client/provider/warden-user-service-event-processing-provider';
import { WardenLoggedInUserWrapper } from '@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper';

@Injectable({providedIn: 'root'})
export class WardenAdapterService implements WardenUserServiceEventProcessingProvider<any> {
  constructor(public router: Router) {}
  public onAutomaticLogout(): void {
    // Make sure we leave
    this.router.navigate(['/public/login']).then(No.op);
  }

  public onAutomaticTokenRefresh(_refreshUser: WardenLoggedInUserWrapper<any>): void {
    Logger.info('User token refreshed');
  }

  public onLoginFailure(reason: string): void {
    Logger.info('Failed to login: %s', reason);
  }

  public onLogout(): void {
    // Make sure we leave
    this.router.navigate(['/public/login']).then(No.op);
  }

  public onSuccessfulLogin(newUser: WardenLoggedInUserWrapper<any>): void {
    Logger.info('Logged in as %s', newUser?.userObject?.loginData?.userLabel);
  }
}
