import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { WardenUserService } from "@bitblit/ratchet-warden-common/client/warden-user-service";
import { No } from "@bitblit/ratchet-common/lang/no";
import { ACUTE_WARDEN_DEFAULT_IF_LOGGED_IN_PATH, ACUTE_WARDEN_LOGIN_PATH } from "../constants.ts";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";

@Injectable()
export class NotLoggedInGuard implements CanActivate {
  constructor(
    private userService: WardenUserService<any>,
    private router: Router,
    @Inject(ACUTE_WARDEN_DEFAULT_IF_LOGGED_IN_PATH) private defaultIfLoggedInPath: string,
    @Inject(ACUTE_WARDEN_LOGIN_PATH) private loginPath: string
  ) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.defaultIfLoggedInPath, 'ACUTE_WARDEN_DEFAULT_IF_LOGGED_IN_PATH');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.loginPath, 'ACUTE_WARDEN_LOGIN_PATH');
  }

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    Logger.info('--- %j', route.queryParamMap);
    if (route.queryParamMap.get('logout') === 'true') {
      Logger.info('Logging out...');
      this.userService.logout();
      this.router.navigate([this.loginPath]).then(No.op);
    }

    if (this.userService.isLoggedIn()) {
      // Redirect to the default or saved
      const target: string = this.defaultIfLoggedInPath;

      Logger.info('NotLoggedInGuard fail(logged in) : Redirecting to logged in %s', target);
      this.router.navigate([target]).then(No.op);
      return false;
    }
    return true;
  }
}
