# Flitt Payment Integration Setup Guide

## Quick Start

This guide will help you set up the Flitt payment integration for the MediMind Expert plan component.

## Prerequisites

1. Flitt merchant account (test account)
2. Access to Flitt testing environment
3. Environment variable configuration access

## Step 1: Get Flitt Test Credentials

1. Visit [Flitt Testing Page](https://flitt.com/testing)
2. Create a test merchant account
3. Note down the following credentials:
   - Test Merchant ID
   - Payment Secret Key
   - Test API endpoints

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Flitt Payment Gateway Configuration
VITE_FLITT_MERCHANT_ID=1549901
VITE_FLITT_SECRET_KEY=your_actual_secret_key_here
VITE_FLITT_BASE_URL=https://pay.flitt.com/api/checkout/url

# Supabase Configuration (if needed for callbacks)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/plan` in your browser

3. Configure a test order:
   - Order ID: `TestOrder_123`
   - Amount: `1000` (10.00 GEL)
   - Description: `Test Payment`

4. Click "Test Payment" to create an order

5. Use the provided test card information to complete the payment

## Step 4: Verify Callback Handling

1. After payment completion, you should be redirected to `/plan/success`
2. Check the payment status display
3. Verify callback data is received correctly

## Test Card Information

Use these test cards for payment testing:

### Visa Test Card
- **Number:** 4111 1111 1111 1111
- **Expiry:** 12/25
- **CVV:** 123

### Mastercard Test Card
- **Number:** 5555 5555 5555 4444
- **Expiry:** 12/25
- **CVV:** 123

## Troubleshooting

### Common Issues

#### "Failed to create order" Error
- Check if environment variables are set correctly
- Verify Flitt API credentials
- Ensure network connectivity

#### Callback Not Working
- Verify webhook URL is accessible
- Check server logs for errors
- Ensure callback endpoint is properly configured

#### Mobile Display Issues
- Test on different devices
- Check responsive CSS
- Verify touch targets are properly sized

## Production Deployment

### Before Going Live

1. **Update Credentials:**
   - Replace test credentials with production ones
   - Update API endpoints to production URLs
   - Configure production webhook URLs

2. **Security Review:**
   - Implement proper HMAC signature validation
   - Review callback security
   - Test with real payment methods

3. **Monitoring Setup:**
   - Configure payment monitoring
   - Set up error alerting
   - Implement logging

## API Documentation

### Order Creation Request

```typescript
interface FlittOrderRequest {
  request: {
    version: "1.0.1";
    order_id: string;
    currency: "GEL";
    merchant_id: number;
    order_desc: string;
    amount: number;
    response_url: string;
    server_callback_url: string;
    signature: string;
  };
}
```

### Order Creation Response

```typescript
interface FlittOrderResponse {
  response_status: string;
  checkout_url?: string;
  payment_id?: string;
  error?: string;
}
```

## Support

For technical support:

- **Flitt Documentation:** [https://flitt.com/docs](https://flitt.com/docs)
- **MediMind Support:** support@medimindexpert.com
- **Component Documentation:** `/src/components/Plan/README.md`

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` files to version control
2. Use different credentials for test and production
3. Implement proper signature validation in production
4. Monitor payment callbacks for security
5. Use HTTPS for all payment-related endpoints

## Next Steps

After successful integration:

1. Implement subscription management
2. Add payment history features
3. Set up automated billing
4. Configure monitoring and analytics
5. Plan for production deployment


