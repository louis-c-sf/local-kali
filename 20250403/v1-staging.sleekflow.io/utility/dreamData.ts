declare global {
  interface Window {
    analytics: any;
    dataLayer: any;
  }
}

export const trackDreamData = (event: string, email: string) => {
  window.analytics?.identify(null, { email });
  window.analytics?.track(event);
};
