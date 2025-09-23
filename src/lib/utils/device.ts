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

  const isUserAgentMobile = mobileRegex.some((regex) => regex.test(userAgent));
  
  // Only consider viewport width for mobile detection if it's a genuinely small screen
  // and not just a resized desktop browser window
  const isSmallViewport = window.innerWidth <= 768;
  
  // For large desktop screens (> 1024px), never consider mobile regardless of zoom/responsive tools
  const isLargeDesktop = window.innerWidth > 1024;
  
  if (isLargeDesktop) {
    return isUserAgentMobile; // Only mobile if actual mobile device
  }
  
  return isUserAgentMobile || isSmallViewport;
};