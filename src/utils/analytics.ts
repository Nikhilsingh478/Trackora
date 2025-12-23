/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Access the environment variable
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  // Defensive check: if no ID, don't initialize
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA_MEASUREMENT_ID is missing. Analytics disabled.');
    return;
  }

  // Prevent multiple initializations
  if (typeof window.gtag !== 'undefined') return;

  // Create the script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  
  // Handle script load error
  script.onerror = () => {
    console.warn('Failed to load Google Analytics script. Possibly blocked by ad blocker.');
  };

  // Inject into document
  document.head.appendChild(script);

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    debug_mode: import.meta.env.DEV // Enable DebugView in local development
  });
};

// Track a custom event
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window.gtag !== 'function') {
    // Analytics likely blocked or not initialized
    return;
  }
  
  try {
    window.gtag('event', eventName, parameters);
  } catch (error) {
    console.warn('Error tracking GA event:', error);
  }
};
