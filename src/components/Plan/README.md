# MediMind Expert - Plan Component Documentation

## Overview

The Plan component implements a test payment page using Flitt payment gateway, designed to be visually consistent with the existing MediMind Expert site. It provides a professional interface for testing payment flows and subscription management.

## Components

### 1. PlanPage.tsx
The main plan selection and payment interface component.

**Features:**
- Three-tier pricing display (Basic, Professional, Enterprise)
- Test payment configuration panel
- Real-time Flitt API integration
- Mobile-responsive design
- Professional medical UI styling

**Key Functionality:**
- Configurable test order parameters
- Flitt API order creation
- Payment status display
- Error handling and validation
- Test card information display

### 2. FlittCallback.tsx
Handles payment callback responses from Flitt gateway.

**Features:**
- URL parameter parsing
- Payment status display
- Success/failure handling
- User-friendly result presentation
- Navigation back to plans or home

### 3. Configuration Files

#### flitt.ts
Centralized Flitt API configuration and utilities.

**Configuration Options:**
- Merchant ID and secret key
- API endpoints
- Test card information
- Signature generation
- Order request helpers

## API Integration

### Flitt Payment Gateway

The component integrates with Flitt's test environment for payment processing.

**API Endpoints:**
- Order Creation: `https://pay.flitt.com/api/checkout/url`
- Callback URL: `/api/flitt-callback`

**Required Environment Variables:**
```bash
VITE_FLITT_MERCHANT_ID=1549901
VITE_FLITT_SECRET_KEY=your_secret_key_here
VITE_FLITT_BASE_URL=https://pay.flitt.com/api/checkout/url
```

### Backend Integration

#### flitt-callback.ts
Netlify function for handling Flitt webhook callbacks.

**Functionality:**
- Receives payment status updates
- Updates user subscription status
- Stores payment records
- Handles error scenarios

## Usage

### Accessing the Plan Page

Navigate to `/plan` in your browser to access the payment interface.

### Testing Payments

1. **Configure Test Order:**
   - Order ID: Auto-generated or custom
   - Amount: Set in tetri (1 GEL = 100 tetri)
   - Description: Payment description

2. **Create Test Order:**
   - Click "Test Payment" button
   - System creates order via Flitt API
   - Displays checkout URL when successful

3. **Complete Payment:**
   - Click "Open Checkout Page"
   - Use provided test card information
   - Complete payment in Flitt interface

4. **Handle Callback:**
   - Redirected to `/plan/success`
   - Payment status displayed
   - Option to return to plans or home

## Test Card Information

### Visa Test Card
- **Number:** 4111 1111 1111 1111
- **Expiry:** 12/25
- **CVV:** 123

### Mastercard Test Card
- **Number:** 5555 5555 5555 4444
- **Expiry:** 12/25
- **CVV:** 123

## Styling and Design

### Design System Integration
- Uses MediMind Expert's medical color palette
- Implements responsive design patterns
- Follows mobile-first approach
- Includes professional medical UI elements

### Key Styling Features
- Medical blue gradient backgrounds
- Professional card layouts
- Touch-friendly mobile interfaces
- Consistent typography and spacing
- Accessibility-compliant design

## Security Considerations

### Environment Variables
- Store sensitive credentials in environment variables
- Use different keys for test and production
- Never commit secrets to version control

### Signature Generation
- Current implementation uses simplified base64 encoding
- Production should implement proper HMAC-SHA256
- Validate all incoming callback signatures

### Data Protection
- No sensitive payment data stored in frontend
- All payment processing handled by Flitt
- Callback data logged for audit purposes

## Error Handling

### Frontend Error Handling
- Network error detection
- API response validation
- User-friendly error messages
- Retry mechanisms

### Backend Error Handling
- Callback validation
- Database error recovery
- Logging and monitoring
- Graceful failure handling

## Mobile Responsiveness

### Responsive Features
- Mobile-first CSS design
- Touch-friendly button sizes (44px minimum)
- Responsive grid layouts
- Optimized typography scaling
- Safe area support for modern devices

### Mobile-Specific Optimizations
- Prevented iOS zoom on input focus
- Touch-optimized form controls
- Mobile navigation patterns
- Responsive card layouts

## Testing

### Manual Testing
1. Navigate to `/plan`
2. Configure test order parameters
3. Create test order
4. Complete payment with test cards
5. Verify callback handling
6. Test error scenarios

### Automated Testing
- Component unit tests
- API integration tests
- Mobile responsiveness tests
- Accessibility compliance tests

## Deployment

### Environment Setup
1. Set required environment variables
2. Configure Flitt merchant account
3. Set up webhook endpoints
4. Test payment flows

### Production Considerations
- Use production Flitt credentials
- Implement proper signature validation
- Set up monitoring and logging
- Configure SSL certificates
- Test with real payment methods

## Troubleshooting

### Common Issues

#### Order Creation Fails
- Check environment variables
- Verify Flitt API credentials
- Check network connectivity
- Validate order parameters

#### Callback Not Received
- Verify webhook URL configuration
- Check server logs
- Ensure callback endpoint is accessible
- Validate signature generation

#### Mobile Display Issues
- Test on various devices
- Check CSS media queries
- Verify touch target sizes
- Test safe area handling

## Future Enhancements

### Planned Features
- Subscription management interface
- Payment history display
- Multiple payment methods
- Automated billing cycles
- Invoice generation

### Technical Improvements
- Enhanced signature validation
- Better error recovery
- Performance optimizations
- Advanced analytics
- A/B testing integration

## Support

For technical support or questions about the Plan component:

- **Email:** support@medimindexpert.com
- **Documentation:** This README file
- **Code Repository:** MediMind Expert GitHub repository

## License

This component is part of the MediMind Expert application and follows the same licensing terms.


