import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { WardenUtils } from '@bitblit/ratchet-warden-common/common/util/warden-utils';
import { WardenDelegatingCurrentUserProvidingUserServiceEventProcessingProvider } from '@bitblit/ratchet-warden-common/client/warden-delegating-current-user-providing-user-service-event-processing-provider';
import { WardenUserService } from '@bitblit/ratchet-warden-common/client/warden-user-service';
import { No } from '@bitblit/ratchet-common/lang/no';
import { DurationRatchet } from '@bitblit/ratchet-common/lang/duration-ratchet';
import {WardenLoggedInUserWrapper} from "@bitblit/ratchet-warden-common/client/provider/warden-logged-in-user-wrapper";
import {WardenWebAuthnEntrySummary} from "@bitblit/ratchet-warden-common/common/model/warden-web-authn-entry-summary";
import {ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {CommonModule} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";

@Component({
  selector: 'ngx-acute-warden-user-profile',
  templateUrl: './acute-user-profile.component.html',
  standalone: true,
  imports: [ButtonModule, CardModule, CommonModule, TooltipModule],

})
export class AcuteUserProfileComponent {
  public user: WardenLoggedInUserWrapper<any>;
  public timeLeftMS: string;

  constructor(
    private router: Router,
    private userService: WardenUserService<any>,
    private userProvider: WardenDelegatingCurrentUserProvidingUserServiceEventProcessingProvider<any>,
  ) {
    Logger.info('Construct AcuteUserProfileComponent');
    this.updateData();
    this.userProvider.currentUserSubject.subscribe((_val) => {
      this.updateData();
    });
  }

  private updateData(): void {
    Logger.info('Called updateData');
    const tok: WardenLoggedInUserWrapper<any> = this.userService.fetchLoggedInUserWrapper();
    this.user = tok;
    this.timeLeftMS = this?.user?.userObject?.exp ? DurationRatchet.formatMsDuration(this.user.userObject.exp * 1000 - Date.now()) : '0';
  }

  public async refreshToken(): Promise<void> {
    await this.userService.refreshToken();
    this.updateData();
  }

  public async addContact(): Promise<void> {
    const value: string = prompt('Please enter a phone number or email address to add');
    const newContact: WardenContact = WardenUtils.stringToWardenContact(value);
    if (newContact) {
      const rval: boolean = await this.userService.addContactToLoggedInUser(newContact);
      if (rval) {
        await this.userService.refreshToken();
      } else {
        Logger.info('Add contact failed : %s', value);
      }
    } else {
      Logger.info('No contact found for %s', value);
    }
  }

  public async addWebAuthnDevice(): Promise<void> {
    await this.userService.saveCurrentDeviceAsWebAuthnForCurrentUser();
    await this.userService.refreshToken();
  }

  public async removeContact(ct: WardenContact): Promise<void> {
    Logger.info('Remove %j', ct);
    await this.userService.removeContactFromLoggedInUser(ct);
    await this.userService.refreshToken();
  }

  public async removeWebAuthn(webId: WardenWebAuthnEntrySummary): Promise<void> {
    Logger.info('Remove webauthn: %s', webId);
    await this.userService.removeWebAuthnRegistrationFromLoggedInUser(webId.credentialIdBase64);
    await this.userService.refreshToken();
  }

  public webAuthLabel(webId: WardenWebAuthnEntrySummary): string {
    let rval: string = 'Error - missing';
    if (webId) {
      rval = webId.credentialIdBase64.substring(0, 4).toUpperCase() + ' : ';
      rval += StringRatchet.trimToNull(webId.applicationName) ? webId.applicationName + ' ' : '';
      rval += StringRatchet.trimToNull(webId.deviceLabel) ? webId.deviceLabel + ' ' : '';
      rval += StringRatchet.trimToNull(webId.origin) ? webId.origin + ' ' : '';
    }
    return rval;
  }

  performLogout(): void {
    this.userService.logout();
    this.router.navigate(['/public/login']).then(No.op);
  }
}
