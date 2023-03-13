import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCommonModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { WardenUserProfileComponent } from './warden-user-profile.component';

@NgModule({
  imports: [MatCardModule, MatCommonModule, MatButtonModule, MatTooltipModule, MatIconModule, CommonModule],
  declarations: [WardenUserProfileComponent],
  exports: [WardenUserProfileComponent],
})
export class WardenUserProfileModule {}
