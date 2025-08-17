// Check if the current device is mobile
export const isMobile = (): boolean => {
  // Check if running in browser environment
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent || window.navigator.vendor;
  
  // Regular expressions for mobile devices
  const mobileRegex = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return mobileRegex.some((regex) => regex.test(userAgent)) || 
    // Additional check for mobile browsers
    (window.innerWidth <= 768);
};