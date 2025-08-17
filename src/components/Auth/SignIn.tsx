import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { MobileInput, MobileButton } from '../ui/mobile-form';
import { useAuth } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithPassword } = useAuth();
  const { t } = useTranslation();

  const signInSchema = z.object({
    email: z.string().email({ message: t('validation.invalidEmail') }),
    password: z.string().min(6, { message: t('validation.passwordMinLength') }),
  });

  type SignInFormValues = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    const [result, error] = await safeAsync(
      () => signInWithPassword({ email: data.email, password: data.password }),
      {
        context: 'user sign in',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      // Set form-level errors based on the error type
      if (error.message.includes('Invalid login credentials')) {
        setError('email', { message: t('auth.errors.invalidCredentials') });
        setError('password', { message: t('auth.errors.invalidCredentials') });
      } else if (error.message.includes('Email not confirmed')) {
        setError('email', { message: t('auth.errors.emailNotConfirmed') });
      } else {
        setError('email', { message: t('auth.errors.signInFailed') });
      }
      return;
    }

    navigate('/');
  };

  return (
    <AuthLayout title={t('auth.signInTitle')}>
      <div className="px-2 sm:px-4">
        <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 sm:space-y-5">
            {/* Email Input */}
            <MobileInput
              id="email"
              type="email"
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              icon={Mail}
              error={errors.email?.message}
              disabled={isSubmitting}
              required
              {...register('email')}
            />

            {/* Password Input */}
            <MobileInput
              id="password"
              type="password"
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="current-password"
              icon={Lock}
              error={errors.password?.message}
              disabled={isSubmitting}
              required
              {...register('password')}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-4">
            <MobileButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full min-h-[44px] sm:min-h-[48px]"
              size="lg"
            >
              {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
            </MobileButton>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 sm:space-y-4 text-center pt-2">
            <div className="text-sm sm:text-base">
              <Link
                to="/signup"
                className="inline-block font-medium text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/90 transition-colors duration-200 touch-target-md px-4 py-2 rounded-lg focus-enhanced"
              >
                {t('auth.noAccount')}
              </Link>
            </div>
            
            <div className="text-sm sm:text-base">
              <Link
                to="/forgot-password"
                className="inline-block font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 touch-target-md px-4 py-2 rounded-lg focus-enhanced"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};