import { Component, OnInit } from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'ngx-acute-common-dynamic-404-helper',
  templateUrl: './dynamic-404-helper.component.html',
  standalone: true,
  imports:  [RouterModule, FormsModule, CommonModule],

})
export class Dynamic404HelperComponent implements OnInit {
  redirectState: string = null;

  // These handle redirecting historical urls
  historicalUrl: any = {
    '/faq': '/help-faq-general',
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    // Check backward compatibility list
    const oldTarget = location.pathname;
    let currentTarget = oldTarget;

    // First, strip any html extensions
    if (currentTarget && currentTarget.toLowerCase().endsWith('.html')) {
      currentTarget = oldTarget.substring(0, oldTarget.length - 5);
    }

    // Next, check any mappings
    if (currentTarget && this.historicalUrl[currentTarget]) {
      currentTarget = this.historicalUrl[currentTarget];
    }

    // Finally, if set, redirect
    if (currentTarget != oldTarget) {
      this.redirectState = 'REDIR';
      Logger.warn('Redirecting ' + oldTarget + ' to ' + currentTarget);
      window.location.pathname = currentTarget;
    } else {
      this.redirectState = 'NO';
    }
  }
}
