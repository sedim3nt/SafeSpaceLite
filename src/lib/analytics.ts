declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAnalyticsEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (!window.gtag) return;

  window.gtag('event', eventName, params);
}

export function sendAnalyticsPageView(pagePath: string) {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: pagePath,
  });
}

