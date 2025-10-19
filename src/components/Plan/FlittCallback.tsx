import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface FlittCallbackData {
  payment_id?: string;
  order_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
  transaction_id?: string;
  error?: string;
}

const FlittCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [callbackData, setCallbackData] = useState<FlittCallbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Parse callback parameters from URL
    const paymentData: FlittCallbackData = {
      payment_id: searchParams.get('payment_id') || undefined,
      order_id: searchParams.get('order_id') || undefined,
      amount: searchParams.get('amount') || undefined,
      currency: searchParams.get('currency') || undefined,
      status: searchParams.get('status') || undefined,
      transaction_id: searchParams.get('transaction_id') || undefined,
      error: searchParams.get('error') || undefined,
    };

    setCallbackData(paymentData);
    
    // Determine if payment was successful
    setIsSuccess(paymentData.status === 'success' && !paymentData.error);
    
    setIsLoading(false);
  }, [searchParams]);

  const handleReturnToPlans = () => {
    navigate('/plan');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-medical-blue-600 mb-4" />
            <p className="text-medical-gray-600">Processing payment response...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isSuccess ? (
              <CheckCircle className="h-16 w-16 text-medical-success-500" />
            ) : (
              <XCircle className="h-16 w-16 text-medical-error-500" />
            )}
          </div>
          <CardTitle className={`text-2xl ${isSuccess ? 'text-medical-success-700' : 'text-medical-error-700'}`}>
            {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {isSuccess 
              ? 'Your payment has been processed successfully.'
              : 'There was an issue processing your payment. Please try again.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Details */}
          {callbackData && (
            <div className="bg-medical-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-medical-gray-900 mb-3">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {callbackData.order_id && (
                  <div>
                    <span className="font-medium text-medical-gray-700">Order ID:</span>
                    <p className="text-medical-gray-600">{callbackData.order_id}</p>
                  </div>
                )}
                {callbackData.payment_id && (
                  <div>
                    <span className="font-medium text-medical-gray-700">Payment ID:</span>
                    <p className="text-medical-gray-600">{callbackData.payment_id}</p>
                  </div>
                )}
                {callbackData.amount && (
                  <div>
                    <span className="font-medium text-medical-gray-700">Amount:</span>
                    <p className="text-medical-gray-600">
                      {callbackData.currency} {(parseInt(callbackData.amount) / 100).toFixed(2)}
                    </p>
                  </div>
                )}
                {callbackData.status && (
                  <div>
                    <span className="font-medium text-medical-gray-700">Status:</span>
                    <p className={`font-medium ${
                      callbackData.status === 'success' 
                        ? 'text-medical-success-600' 
                        : 'text-medical-error-600'
                    }`}>
                      {callbackData.status.toUpperCase()}
                    </p>
                  </div>
                )}
                {callbackData.transaction_id && (
                  <div>
                    <span className="font-medium text-medical-gray-700">Transaction ID:</span>
                    <p className="text-medical-gray-600">{callbackData.transaction_id}</p>
                  </div>
                )}
                {callbackData.error && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-medical-error-700">Error:</span>
                    <p className="text-medical-error-600">{callbackData.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-medical-success-50 border border-medical-success-200 p-4 rounded-lg">
              <h4 className="font-semibold text-medical-success-800 mb-2">What's Next?</h4>
              <ul className="text-sm text-medical-success-700 space-y-1">
                <li>• Your subscription has been activated</li>
                <li>• You can now access all premium features</li>
                <li>• A confirmation email will be sent to you shortly</li>
                <li>• You can manage your subscription from your profile</li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {!isSuccess && callbackData?.error && (
            <div className="bg-medical-error-50 border border-medical-error-200 p-4 rounded-lg">
              <h4 className="font-semibold text-medical-error-800 mb-2">What Happened?</h4>
              <p className="text-sm text-medical-error-700">
                {callbackData.error}
              </p>
              <p className="text-sm text-medical-error-700 mt-2">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReturnToPlans}
              variant="outline"
              className="flex-1"
            >
              Back to Plans
            </Button>
            <Button 
              onClick={handleReturnHome}
              className="flex-1"
            >
              Return Home
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-medical-gray-500">
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@medimindexpert.com" className="text-medical-blue-600 hover:underline">
                support@medimindexpert.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlittCallback;



