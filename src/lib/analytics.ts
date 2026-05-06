export const GA_ID = "G-PSRVS7QM91";

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
