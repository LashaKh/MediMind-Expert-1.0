// Flitt Payment Gateway Configuration
// These are public credentials and configuration settings.
// Secret keys and signature generation are handled on the server.

export const FLITT_CONFIG = {
  // Test merchant ID from Flitt testing page
  merchantId: import.meta.env.VITE_FLITT_MERCHANT_ID || 1549901,
  
  // Flitt API endpoints
  baseUrl: import.meta.env.VITE_FLITT_BASE_URL || 'https://pay.flitt.com/api/checkout/url',
  
  // Response URLs - update these to match your domain
  responseUrl: `${window.location.origin}/plan/success`,
  
  // The server-to-server callback URL is configured on the server
  // callbackUrl: `${window.location.origin}/api/flitt-callback`,
  
  // Currency configuration
  currency: 'GEL',
  
  // API version
  version: '1.0.1'
};

// Test card information for Flitt testing
export const FLITT_TEST_CARDS = {
  visa: {
    number: '4111 1111 1111 1111',
    expiry: '12/25',
    cvv: '123',
    description: 'Visa Test Card'
  },
  mastercard: {
    number: '5555 5555 5555 4444',
    expiry: '12/25',
    cvv: '123',
    description: 'Mastercard Test Card'
  }
};


