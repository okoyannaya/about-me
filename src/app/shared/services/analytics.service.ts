import { DOCUMENT, inject, Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly _document = inject(DOCUMENT);

  public trackEvent(eventName: string): void {
    this._document.defaultView?.gtag?.('event', eventName);
  }
}
