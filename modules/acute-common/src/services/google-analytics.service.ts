import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
// See : https://lumin8media.com/blog/add-google-analytics-angular
export class GoogleAnalyticsService {
  private static readonly IS_PROD: boolean = true;

  constructor(private router: Router) {}

  public initialize() {
    this.onRouteChange();

    // dynamically add analytics scripts to document head
    try {
      const url: string = 'https://www.googletagmanager.com/gtag/js?id=';
      const gTagScript = document.createElement('script');
      gTagScript.async = true;
      const tagId: string = GoogleAnalyticsService.IS_PROD ? 'G-7D5BBK4K8X' : null;
      gTagScript.src = `${url}${tagId}`;
      document.head.appendChild(gTagScript);

      const dataLayerScript = document.createElement('script');
      dataLayerScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${tagId}', {'send_page_view': false});`;
      document.head.appendChild(dataLayerScript);
    } catch (e) {
      Logger.error('Error adding Google Analytics', e, e);
    }
  }

  // track visited routes
  private onRouteChange() {
    const tagId: string = GoogleAnalyticsService.IS_PROD ? 'G-7D5BBK4K8X' : null;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', tagId, {
          page_path: event.urlAfterRedirects,
        });

        Logger.info('Sending Google Analytics tracking for: ', event.urlAfterRedirects);
        Logger.info('Google Analytics property ID: ', tagId);
      }
    });
  }

  // use gtag.js to send Google Analytics Events
  public event(action: string, eventCategory?: string, eventLabel?: string, value?: string) {
    gtag('event', action, {
      ...(eventCategory && { event_category: eventCategory }),
      ...(eventLabel && { event_label: eventLabel }),
      ...(value && { value: value }),
    });
  }
}
