import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {WardenUserService} from "@bitblit/ratchet-warden-common/client/warden-user-service";
import {No} from "@bitblit/ratchet-common/lang/no";

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private userService: WardenUserService<any>,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.userService.isLoggedIn()) {
      // Save the current target
      //Logger.info('Saving target as %s', state.url);
      //const stored: ParatradeLocalConfig = this.localStorageService.fetch();
      //stored.redirectTarget = state.url;
      //this.localStorageService.update(stored);

      this.router.navigate(['/public/login'], { queryParams: { returnUrl: state.url } }).then(No.op);
      return false;
    }
    return true;
  }
}
