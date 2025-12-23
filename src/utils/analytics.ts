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

// Google Analytics initialization is handled in index.html

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
