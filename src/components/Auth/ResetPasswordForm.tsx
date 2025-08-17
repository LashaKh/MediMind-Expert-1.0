import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { MobileInput, MobileButton } from '../ui/mobile-form';
import { supabase } from '../../lib/supabase';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(12, { message: 'Password must be at least 12 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have a session (user clicked reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Redirect to sign in if no session
        navigate('/signin');
      }
    });
  }, [navigate]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    setError('');
    
    const [result, errorResult] = await safeAsync(
      async () => {
        const { error: updateError } = await supabase.auth.updateUser({
          password: data.password
        });

        if (updateError) {
          throw updateError;
        }

        return { success: true };
      },
      {
        context: 'password reset',
        severity: ErrorSeverity.HIGH,
        showToast: true
      }
    );

    if (errorResult) {
      setError(errorResult.message || 'An error occurred while updating your password');
      return;
    }

    setIsSuccess(true);
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate('/workspace');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Password Updated">
        <div className="text-center">
          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20 mb-6">
            <div className="text-sm text-green-700 dark:text-green-300">
              Your password has been successfully updated. You will be redirected to your dashboard shortly.
            </div>
          </div>
          <MobileButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/workspace')}
          >
            Go to Dashboard
          </MobileButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password">
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <MobileInput
            id="password"
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.password?.message}
            hint="Must be at least 12 characters with uppercase, lowercase, number, and special character"
            {...register('password')}
          />

          <MobileInput
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            icon={Lock}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
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
            Update Password
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