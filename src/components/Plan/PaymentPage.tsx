import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

// Dynamically load the Flitt SDK script
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.body.appendChild(script);
  });
};

const pricingOptions = [
  { id: 'plan-10', gel: 10, tokens: 100, description: 'Ideal for getting started.' },
  { id: 'plan-15', gel: 15, tokens: 150, description: 'Perfect for regular use.' },
  { id: 'plan-20', gel: 20, tokens: 200, description: 'Best value for heavy users.' },
];

// Define the Flitt SDK type - based on documentation
declare const Flitt: any;

export const PaymentPage: React.FC = () => {
  const [step, setStep] = useState<'planSelection' | 'cardDetails' | 'paymentResult'>('planSelection');
  const [selectedPlan, setSelectedPlan] = useState<string>('plan-15');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const flittRef = useRef<any>(null);

  const handleProceedToCardStep = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/create-payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment request.');
      
      setHostToken(data.hostToken);
      setStep('cardDetails');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to initialize Flitt SDK when we get a host token
  useEffect(() => {
    if (step === 'cardDetails' && hostToken) {
      loadScript('https://cdn.jsdelivr.net/npm/@flittpayments/js-sdk').then(() => {
        try {
          const flitt = new Flitt(hostToken);
          flitt.render('#flitt-card-form');

          flitt.on('success', (response: any) => {
            console.log('Flitt Success:', response);
            setPaymentResult({ status: 'success', message: `Payment successful! Transaction ID: ${response.transaction_id}` });
            setStep('paymentResult');
          });

          flitt.on('error', (error: any) => {
            console.error('Flitt Error:', error);
            setPaymentResult({ status: 'error', message: error.message || 'An error occurred during payment.' });
            setStep('paymentResult');
          });

          flittRef.current = flitt;
        } catch (sdkError) {
          console.error('Flitt SDK Initialization Error:', sdkError);
          setError('Failed to initialize the payment form. Please try again.');
          setStep('planSelection'); // Go back to plan selection
        }
      }).catch(err => {
        console.error(err);
        setError('Could not load the payment script. Please check your internet connection.');
        setStep('planSelection');
      });
    }
  }, [step, hostToken]);

  const handlePay = () => {
    if (flittRef.current) {
      setIsLoading(true);
      setError(null);
      flittRef.current.submit();
    }
  };

  const handleBack = () => {
    setError(null);
    setHostToken(null);
    setStep('planSelection');
    setPaymentResult(null);
    if (flittRef.current) {
      flittRef.current.destroy();
      flittRef.current = null;
    }
  }

  // Render different views based on the current step
  const renderPlanSelection = () => (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">Purchase Tokens</h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Choose a plan that fits your needs.</p>
      </div>
      {error && <Alert variant="destructive" className="mb-8"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingOptions.map((option) => (
          <Card key={option.id} onClick={() => setSelectedPlan(option.id)} className={cn("cursor-pointer transition-all", selectedPlan === option.id ? "border-2 border-blue-500 ring-4 ring-blue-500/20" : "border-gray-200 dark:border-gray-700")}>
            <CardHeader><CardTitle>{option.tokens} Tokens</CardTitle><CardDescription>{option.description}</CardDescription></CardHeader>
            <CardContent><div className="text-4xl font-bold">{option.gel} <span className="text-lg font-medium text-gray-500">GEL</span></div></CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button size="lg" className="w-full max-w-xs mx-auto" onClick={handleProceedToCardStep} disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...</> : 'Enter Card Details'}
        </Button>
      </div>
    </>
  );

  const renderCardDetails = () => (
    <>
      <div className="text-center mb-8">
        <Button variant="ghost" onClick={handleBack} className="absolute top-6 left-6"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Plans</Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Secure Payment</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">You are purchasing {pricingOptions.find(p=>p.id === selectedPlan)?.tokens} tokens for {pricingOptions.find(p=>p.id === selectedPlan)?.gel} GEL.</p>
      </div>
      {/* Flitt SDK will mount its form here */}
      <div id="flitt-card-form" className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"></div>
      {error && <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="mt-8 text-center">
        <Button size="lg" className="w-full max-w-xs mx-auto" onClick={handlePay} disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : `Pay ${pricingOptions.find(p=>p.id === selectedPlan)?.gel} GEL`}
        </Button>
      </div>
    </>
  );

  const renderPaymentResult = () => (
    <div className="text-center">
        {paymentResult?.status === 'success' ? 
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" /> : 
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        }
        <h1 className="text-3xl font-bold">{paymentResult?.status === 'success' ? 'Payment Successful' : 'Payment Failed'}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{paymentResult?.message}</p>
        <Button onClick={handleBack} className="mt-8">Make Another Purchase</Button>
    </div>
  );

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 relative">
      {step === 'planSelection' && renderPlanSelection()}
      {step === 'cardDetails' && renderCardDetails()}
      {step === 'paymentResult' && renderPaymentResult()}
    </div>
  );
};