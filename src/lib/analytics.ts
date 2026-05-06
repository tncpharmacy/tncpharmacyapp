export const GA_ID = "G-CWLG5CGKJ8";

export const loadAnalytics = () => {
  if (typeof window === "undefined") return;

  // already loaded?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).gtag) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gtag(...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer.push(args);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
};

export const disableAnalytics = () => {
  // GA disable flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[`ga-disable-${GA_ID}`] = true;
};

export const loadMetaPixel = () => {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).fbq) return;

  // Load script
  const script = document.createElement("script");
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.async = true;
  document.head.appendChild(script);

  // Setup fbq manually
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq = function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq.queue.push(args);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq.queue = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq.loaded = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq.version = "2.0";

  // INIT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq("init", "YOUR_PIXEL_ID");

  // Default block (consent)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq("consent", "revoke");

  // Track page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fbq("track", "PageView");
};
