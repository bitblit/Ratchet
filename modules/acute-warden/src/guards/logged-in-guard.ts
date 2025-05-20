import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { WardenUserService } from "@bitblit/ratchet-warden-common/client/warden-user-service";
import { No } from "@bitblit/ratchet-common/lang/no";
import { ACUTE_WARDEN_DEFAULT_POST_LOGIN_PATH, ACUTE_WARDEN_LOGIN_PATH } from "../constants.ts";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private userService: WardenUserService<any>,
    private router: Router,
    @Inject(ACUTE_WARDEN_LOGIN_PATH) private loginPath: string,
    @Inject(ACUTE_WARDEN_DEFAULT_POST_LOGIN_PATH) private defaultPostLoginPath: string
  ) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.loginPath, 'ACUTE_WARDEN_LOGIN_PATH');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.defaultPostLoginPath, 'ACUTE_WARDEN_DEFAULT_POST_LOGIN_PATH');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.userService.isLoggedIn()) {
      // Storing post-login redirect is handling by the login provider
      const target: string = state.url === this.loginPath ? this.defaultPostLoginPath : state.url;
      this.router.navigate([this.loginPath], { queryParams: { returnUrl: target } }).then(No.op);
      return false;
    }
    return true;
  }
}
