
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// This component will display the payment status to the user after they return from the payment gateway.
export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'unknown'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Typically, the payment gateway will add query parameters to the redirect URL.
    // We read them here to determine the status.
    // This is a basic implementation. A robust solution would also query your backend
    // with the order ID to get the definitive transaction status from your database.
    const paymentStatus = searchParams.get('status');
    const orderIdParam = searchParams.get('order_id');

    setOrderId(orderIdParam);

    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'failed') {
      setStatus('failed');
    } else {
      // If status is not explicitly provided, we can't be sure.
      // A backend check would be needed here.
      setStatus('unknown');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500 mb-4" />
            <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
            <p className="text-gray-500 mt-2">Please wait while we confirm your transaction.</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <p className="text-gray-500 mt-2">Your tokens have been added to your account.</p>
            {orderId && <p className="text-sm text-gray-400 mt-4">Order ID: {orderId}</p>}
            <Button asChild className="mt-6">
              <Link to="/ai-copilot">Go to Dashboard</Link>
            </Button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <p className="text-gray-500 mt-2">There was an issue with your payment. Please try again.</p>
            {orderId && <p className="text-sm text-gray-400 mt-4">Order ID: {orderId}</p>}
            <Button asChild className="mt-6">
              <Link to="/purchase">Try Again</Link>
            </Button>
          </div>
        );
      case 'unknown':
        return (
          <div className="flex flex-col items-center text-center">
            <CardTitle className="text-2xl">Payment Status Unknown</CardTitle>
            <p className="text-gray-500 mt-2">We could not definitively determine the status of your payment.</p>
            <p className="text-gray-500">Please check your account for updated token balance or contact support.</p>
            {orderId && <p className="text-sm text-gray-400 mt-4">Order ID: {orderId}</p>}
            <Button asChild className="mt-6">
              <Link to="/ai-copilot">Go to Dashboard</Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-24 px-4">
      <Card>
        <CardHeader />
        <CardContent className="p-8">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
