import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';

import {Logger} from '@bitblit/ratchet-common/logger/logger';
import {WardenClient} from "@bitblit/ratchet-warden-common/client/warden-client";
import {WardenUserService} from "@bitblit/ratchet-warden-common/client/warden-user-service";
import {No} from "@bitblit/ratchet-common/lang/no";
import {StringRatchet} from "@bitblit/ratchet-common/lang/string-ratchet";
import {WardenContact} from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import {
  WardenRecentLoginDescriptor
} from "@bitblit/ratchet-warden-common/client/provider/warden-recent-login-descriptor";
import {WardenUtils} from "@bitblit/ratchet-warden-common/common/util/warden-utils";
import {WardenContactType} from "@bitblit/ratchet-warden-common/common/model/warden-contact-type";
import {WardenLoggedInUserWrapper} from "@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {CardModule} from "primeng/card";
import {TooltipModule} from "primeng/tooltip";
import {FieldsetModule} from "primeng/fieldset";
import { AlertComponent, WindowRefService } from "@bitblit/ngx-acute-common";
import {DialogService} from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";


@Component({
  selector: 'ngx-acute-warden-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ButtonModule, RouterModule, FormsModule, CommonModule, CardModule, TooltipModule, ButtonModule, FieldsetModule, InputTextModule]
})
export class LoginComponent implements OnInit {
  public showCodeCard: boolean = false;

  public verificationCode: string;
  public waitingContact: WardenContact;

  public newContactValue: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: WardenUserService<any>,
    public wardenClient: WardenClient,
    private win: WindowRefService,
    private dlgService: DialogService,

  ) {
    Logger.info('Found %s recent logins', this.recentLogins.length);
  }

  public userById(index: number, ld: WardenRecentLoginDescriptor) {
    return ld.user.userId;
  }

  public contactByName(index: number, contact: WardenContact) {
    return contact.value;
  }

  public get hasRecentLogins(): boolean {
    return this.recentLogins.length > 0;
  }

  public get recentLogins(): WardenRecentLoginDescriptor[] {
    return this.userService?.serviceOptions?.recentLoginProvider?.fetchAllLogins() || [];
  }

  public clearSavedLogins(): void {
    if (confirm('Are you sure you want to clear saved logins?')) {
      this.userService.serviceOptions.recentLoginProvider.clearAllLogins();
    }
  }
  ngOnInit(): void {
    Logger.info('ngi: %j', this.route.queryParamMap);
  }

  public goToDashboard(): void {
    this.router.navigate(['/secure/dashboard']).then(No.op);
  }

  public async sendCodeToNewContact(value: string): Promise<void> {
    Logger.info('Trying to send code to %s %s %s', value, WardenUtils.stringIsEmailAddress(value), WardenUtils.stringIsPhoneNumber(value));
    if (StringRatchet.trimToNull(value)) {
      let ct: WardenContactType = null;
      if (WardenUtils.stringIsEmailAddress(value)) {
        ct = WardenContactType.EmailAddress;
      } else if (WardenUtils.stringIsPhoneNumber(value)) {
        ct = WardenContactType.TextCapablePhoneNumber;
      }
      if (!ct) {
        AlertComponent.showAlert(this.dlgService, 'Cannot treat this as an email or a phone number - ignoring');
      } else {
        this.waitingContact = { type: ct, value: value };
        const val: boolean = await this.userService.sendExpiringCode(this.waitingContact);
        if (val) {
          this.showCodeCard = true;
        } else {
          AlertComponent.showAlert(this.dlgService, 'Failed to send code');
        }
      }
    }
  }

  public async sendCodeToContact(contact: WardenContact): Promise<void> {
    if (contact && StringRatchet.trimToNull(contact.value) && contact.type) {
      this.waitingContact = contact;
      const val: boolean = await this.userService.sendExpiringCode(contact);
      if (val) {
        this.showCodeCard = true;
      } else {
        alert('Failed to send code');
      }
    } else {
      Logger.info('Failed to send code to contact : %j', contact);
    }
  }

  public async submitVerificationCode(input: string, verificationCode: string): Promise<void> {
    Logger.info('Submit: %s, %s', input, verificationCode);
    const val: WardenLoggedInUserWrapper<any> = await this.userService.executeValidationTokenBasedLogin(
      { type: WardenUtils.stringToContactType(input), value: input },
      verificationCode,
    );

    //alert('Got : ' + JSON.stringify(val));
    //const val: boolean = await this.userService.executeValidationTokenBasedLogin(emailAddress, verificationCode);
    if (val) {
      await this.router.navigate(['/secure/dashboard']);
    }
  }

  public async processWebAuthnLogin(userId: string): Promise<void> {
    Logger.info('processWebAuthnLogin: %s', userId);
    const val: WardenLoggedInUserWrapper<any> = await this.userService.executeWebAuthnBasedLogin(userId);

    //AlertComponent.showAlert(this.dd, 'Got : ' + JSON.stringify(val));
    //const val: boolean = await this.userService.executeValidationTokenBasedLogin(emailAddress, verificationCode);
    if (val) {
      await this.router.navigate(['/secure/dashboard']);
    }
  }

  public async sendMagicLink(contact: WardenContact): Promise<void> {
    const loc: Location = this.win.nativeWindow().location;

    let curUrl: string = loc.toString();
    curUrl = curUrl.indexOf('?') > -1 ? curUrl.substring(0, curUrl.indexOf('?')) : curUrl;
    let landingUrl: string = curUrl.split('public/login').join('public/magic-lander');
    landingUrl += '?code={CODE}&meta={META}';
    const meta: Record<string, string> = {
      redirect: '/secure/dashboard',
    };

    const sent: boolean = await this.wardenClient.sendMagicLink(contact, landingUrl, meta);

    Logger.info('Sent was %s : %s', sent, landingUrl);
  }

  public removeSingleLogin(userId: string): void {
    this.userService.serviceOptions.recentLoginProvider.removeUser(userId);
  }

  public toggleCard(clearCode: boolean): void {
    this.showCodeCard = !this.showCodeCard;
    if (clearCode) {
      this.verificationCode = null;
    }
  }

  public contactValueInvalidAndDirty(): boolean {
    return StringRatchet.trimToNull(this.newContactValue) && !WardenUtils.stringIsPhoneNumber(this.newContactValue);
  }
}
