import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { MobileInput, MobileButton } from '../ui/mobile-form';
import { supabase } from '../../lib/supabase';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

const recoverySchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export const PasswordRecoveryForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
  });

  const onSubmit: SubmitHandler<RecoveryFormValues> = async (data) => {
    setError('');
    
    const [result, errorResult] = await safeAsync(
      async () => {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          data.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

        if (resetError) {
          throw resetError;
        }

        return { success: true };
      },
      {
        context: 'password recovery',
        severity: ErrorSeverity.HIGH,
        showToast: true
      }
    );

    if (errorResult) {
      setError(errorResult.message || 'An error occurred while sending the recovery email');
      return;
    }

    setIsSubmitted(true);
    reset();
  };

  if (isSubmitted) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center">
          <p className="text-white">
            If an account exists for the email address you entered, you will receive a password reset link shortly.
          </p>
          <div className="mt-6">
            <Link
              to="/signin"
              className="font-medium text-accent hover:text-accent/90"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <MobileInput
            id="email"
            type="email"
            label="Email address"
            placeholder="Enter your email address"
            icon={Mail}
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <MobileButton
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Send recovery link
          </MobileButton>
        </div>

        <div className="text-sm text-center">
          <Link
            to="/signin"
            className="font-medium text-white hover:text-gray-200 dark:text-accent dark:hover:text-accent/90 touch-target-sm inline-block py-2 px-4 rounded-lg transition-colors hover:bg-white/10"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
