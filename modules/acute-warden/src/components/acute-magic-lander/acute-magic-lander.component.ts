import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { WardenUserService } from '@bitblit/ratchet-warden-common/client/warden-user-service';
import { No } from '@bitblit/ratchet-common/lang/no';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { Base64Ratchet } from '@bitblit/ratchet-common/lang/base64-ratchet';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { WardenLoggedInUserWrapper } from '@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';

@Component({
  selector: 'ngx-acute-warden-magic-lander',
  templateUrl: './acute-magic-lander.component.html',
  standalone: true,
  imports: [CardModule, RouterModule, FormsModule, CommonModule, CardModule, ButtonDirective],
})
export class AcuteMagicLanderComponent implements OnInit {
  @Input() public directLoginUrl: string;

  public currentStatus: string = 'Starting up...';
  public showLoginButton: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: WardenUserService<any>,
  ) {}

  ngOnInit(): void {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(this.directLoginUrl, 'directLoginUrl may not be empty');
    this.currentStatus = 'Parsing parameters...';
    const codeString: string = StringRatchet.trimToNull(this.route.snapshot.queryParamMap.get('code'));
    const metaString: string = this.route.snapshot.queryParamMap.get('meta');
    const t2: string = Base64Ratchet.base64StringToString(metaString);
    const meta: Record<string, string> = Base64Ratchet.safeBase64JSONParse(metaString);
    Logger.info('ngi: %j : Code %s : Meta %s :: %s :: MetaP: %j', this.route.queryParamMap, codeString, metaString, t2, meta);

    this.processParameters(codeString, meta).then(No.op);
  }

  public async processParameters(verificationCode: string, meta: any): Promise<void> {
    const targetContact: WardenContact = (meta || {}).contact;
    if (verificationCode && targetContact?.value && targetContact?.type) {
      this.currentStatus = 'Logging in...';
      Logger.info('Logging in with code');
      try {
        const val: WardenLoggedInUserWrapper<any> = await this.userService.executeValidationTokenBasedLogin(
          targetContact,
          verificationCode,
        );
        Logger.info('Rval from login was : %j', val);
      } catch (err) {
        Logger.error('Failed to login : %s', err, err);
        this.currentStatus = 'Failed to login : ' + err;
        this.showLoginButton = true;
      }
    } else {
      Logger.info('Could not login, missing code or contact : %s : %j', verificationCode, targetContact);
    }
    if (this.userService.isLoggedIn()) {
      if (meta?.redirect) {
        Logger.info('Meta redirect to %s requested', meta.redirect);
        this.currentStatus = 'Redirecting to ' + meta.redirect;
        await this.router.navigate([meta.redirect]);
      }
    } else {
      Logger.info('Ignoring meta - not logged in.');
      this.currentStatus = 'Login failed - sending to login page';
      this.showLoginButton = true;
    }
  }
}
