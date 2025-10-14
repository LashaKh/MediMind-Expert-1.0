import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { FLITT_CONFIG, FLITT_TEST_CARDS, createFlittOrderRequest } from '../../config/flitt';

interface FlittOrderRequest {
  request: {
    version: string;
    order_id: string;
    currency: string;
    merchant_id: number;
    order_desc: string;
    amount: number;
    response_url: string;
    server_callback_url: string;
    signature: string;
  };
}

interface FlittOrderResponse {
  response_status: string;
  checkout_url?: string;
  payment_id?: string;
  error?: string;
}

const PlanPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState<FlittOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState({
    orderId: `TestOrder_${Date.now()}`,
    amount: 1000, // 10.00 GEL in tetri
    description: 'MediMind Expert Premium Subscription Test'
  });


  const createTestOrder = async () => {
    setIsLoading(true);
    setError(null);
    setOrderResponse(null);

    try {
      const orderRequest: FlittOrderRequest = createFlittOrderRequest(orderData);

      console.log('Creating test order:', orderRequest);

      const response = await fetch(FLITT_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      const result: FlittOrderResponse = await response.json();
      console.log('Flitt response:', result);

      if (result.response_status === 'success' && result.checkout_url) {
        setOrderResponse(result);
      } else {
        setError(result.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCheckout = () => {
    if (orderResponse?.checkout_url) {
      window.open(orderResponse.checkout_url, '_blank');
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-medical-gray-900 mb-4">
            MediMind Expert Premium Plans
          </h1>
          <p className="text-lg text-medical-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your medical practice. Test payments are processed securely through Flitt.
          </p>
        </div>

        {/* Test Configuration Card */}
        <Card className="mb-8 border-medical-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-medical-blue-600" />
              Test Payment Configuration
            </CardTitle>
            <CardDescription>
              Configure your test order parameters for Flitt payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderData.orderId}
                  onChange={(e) => setOrderData(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="TestOrder_123456"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (Tetri)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={orderData.amount}
                  onChange={(e) => setOrderData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  placeholder="1000"
                />
                <p className="text-sm text-medical-gray-500 mt-1">
                  GEL {formatAmount(orderData.amount)}
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Order Description</Label>
              <Input
                id="description"
                value={orderData.description}
                onChange={(e) => setOrderData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Premium Subscription Test"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Basic Plan */}
          <Card className="relative border-medical-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Basic Plan</CardTitle>
              <CardDescription>Essential medical tools</CardDescription>
              <div className="text-3xl font-bold text-medical-gray-900">
                Free
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-medical-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Basic AI Chat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  5 Medical Calculators
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Limited Document Upload
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative border-medical-blue-300 hover:shadow-lg transition-shadow ring-2 ring-medical-blue-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-medical-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Professional Plan</CardTitle>
              <CardDescription>Advanced medical features</CardDescription>
              <div className="text-3xl font-bold text-medical-gray-900">
                GEL {formatAmount(orderData.amount)}
                <span className="text-lg font-normal text-medical-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-medical-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Advanced AI Copilot
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  30+ Medical Calculators
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Unlimited Document Upload
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Case Management
                </li>
              </ul>
              <Button 
                onClick={createTestOrder}
                disabled={isLoading}
                className="w-full mt-6 bg-medical-blue-600 hover:bg-medical-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Test Payment'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative border-medical-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise Plan</CardTitle>
              <CardDescription>Complete medical suite</CardDescription>
              <div className="text-3xl font-bold text-medical-gray-900">
                Custom
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-medical-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Everything in Professional
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Multi-user Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Custom Integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-medical-success-500" />
                  Priority Support
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-medical-error-200 bg-medical-error-50">
            <AlertDescription className="text-medical-error-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Response */}
        {orderResponse && (
          <Card className="mb-6 border-medical-success-200 bg-medical-success-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-medical-success-800">
                <CheckCircle className="h-5 w-5" />
                Order Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Payment ID:</strong> {orderResponse.payment_id}</p>
                <p><strong>Order ID:</strong> {orderData.orderId}</p>
                <p><strong>Amount:</strong> GEL {formatAmount(orderData.amount)}</p>
                <p><strong>Status:</strong> {orderResponse.response_status}</p>
              </div>
              
              {orderResponse.checkout_url && (
                <div className="mt-4">
                  <Button 
                    onClick={openCheckout}
                    className="bg-medical-success-600 hover:bg-medical-success-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Checkout Page
                  </Button>
                  <p className="text-xs text-medical-gray-500 mt-2">
                    Click to open the Flitt payment page in a new tab
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="border-medical-blue-200 bg-medical-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-blue-800">
              <Shield className="h-5 w-5" />
              Secure Payment Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-medical-blue-700 space-y-2">
              <p>
                This is a test payment page using Flitt's secure payment gateway. 
                All transactions are processed with bank-level security and encryption.
              </p>
              <p>
                <strong>Test Card Information:</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-sm">{FLITT_TEST_CARDS.visa.description}</p>
                  <p className="text-xs text-gray-600">Card: {FLITT_TEST_CARDS.visa.number}</p>
                  <p className="text-xs text-gray-600">Expiry: {FLITT_TEST_CARDS.visa.expiry}</p>
                  <p className="text-xs text-gray-600">CVV: {FLITT_TEST_CARDS.visa.cvv}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-sm">{FLITT_TEST_CARDS.mastercard.description}</p>
                  <p className="text-xs text-gray-600">Card: {FLITT_TEST_CARDS.mastercard.number}</p>
                  <p className="text-xs text-gray-600">Expiry: {FLITT_TEST_CARDS.mastercard.expiry}</p>
                  <p className="text-xs text-gray-600">CVV: {FLITT_TEST_CARDS.mastercard.cvv}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanPage;
