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
import { useTranslation } from '../../hooks/useTranslation';

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();

  const resetPasswordSchema = z.object({
    password: z.string()
      .min(12, { message: t('validation.passwordMinLength12', 'Password must be at least 12 characters long') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: t('validation.passwordComplexity', 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch', 'Passwords do not match'),
    path: ['confirmPassword'],
  });

  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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
    const handleResetPasswordToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setError(t('auth.resetPassword.invalidLink', 'Invalid or expired reset link. Please request a new one.'));
            navigate('/forgot-password');
            return;
          }

          if (session) {
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        } catch (err) {
          setError(t('auth.resetPassword.linkProcessError', 'Failed to process reset link. Please try again.'));
          navigate('/forgot-password');
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
      }
    };

    handleResetPasswordToken();
  }, [navigate, t]);

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
      setError(errorResult.message || t('auth.resetPassword.genericError', 'An error occurred while updating your password'));
      return;
    }

    setIsSuccess(true);
    
    setTimeout(() => {
      navigate('/workspace');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <AuthLayout title={t('auth.resetPassword.successTitle', 'Password Updated')}>
        <div className="text-center">
          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20 mb-6">
            <div className="text-sm text-green-700 dark:text-green-300">
              {t('auth.resetPassword.successMessage', 'Your password has been successfully updated. You will be redirected to your dashboard shortly.')}
            </div>
          </div>
          <MobileButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/workspace')}
          >
            {t('auth.resetPassword.goToDashboard', 'Go to Dashboard')}
          </MobileButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.resetPassword.title', 'Set New Password')}>
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
            label={t('auth.resetPassword.passwordLabel', 'New Password')}
            placeholder={t('auth.resetPassword.passwordPlaceholder', 'Enter your new password')}
            icon={Lock}
            autoComplete="new-password"
            error={errors.password?.message}
            hint={t('validation.passwordHint12', 'Must be at least 12 characters with uppercase, lowercase, number, and special character')}
            {...register('password')}
          />

          <MobileInput
            id="confirmPassword"
            type="password"
            label={t('auth.resetPassword.confirmPasswordLabel', 'Confirm New Password')}
            placeholder={t('auth.resetPassword.confirmPasswordPlaceholder', 'Confirm your new password')}
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
            {t('auth.resetPassword.submitButton', 'Update Password')}
          </MobileButton>
        </div>

        <div className="text-sm text-center">
          <Link
            to="/signin"
            className="font-medium text-white hover:text-gray-200 dark:text-accent dark:hover:text-accent/90 touch-target-sm inline-block py-2 px-4 rounded-lg transition-colors hover:bg-white/10"
          >
            {t('auth.passwordRecovery.backToSignIn', 'Back to Sign In')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};