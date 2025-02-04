import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { WardenUserService } from '@bitblit/ratchet-warden-common/client/warden-user-service';
import { No } from '@bitblit/ratchet-common/lang/no';

@Injectable()
export class NotLoggedInGuard implements CanActivate {
  constructor(
    private userService: WardenUserService<any>,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    Logger.info('--- %j', route.queryParamMap);
    if (route.queryParamMap.get('logout') === 'true') {
      Logger.info('Logging out...');
      this.userService.logout();
      this.router.navigate(['/public/login']).then(No.op);
    }

    if (this.userService.isLoggedIn()) {
      // Redirect to the dashboard or saved
      const target: string = '/secure/dashboard';

      Logger.info('NotLoggedInGuard fail(logged in) : Redirecting to logged in %s', target);
      this.router.navigate([target]).then(No.op);
      return false;
    }
    return true;
  }
}
