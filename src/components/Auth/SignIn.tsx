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
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Welcome Message */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {t('auth.signInWelcome')}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            {/* Enhanced Email Input */}
            <div className="group">
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
                className="transition-all duration-300 group-hover:border-[#63b3ed]/30"
                {...register('email')}
              />
            </div>

            {/* Enhanced Password Input */}
            <div className="group">
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
                className="transition-all duration-300 group-hover:border-[#63b3ed]/30"
                {...register('password')}
              />
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <div className="pt-4">
            <MobileButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              <span className="flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t('auth.signingIn')}</span>
                  </>
                ) : (
                  <span>{t('auth.signIn')}</span>
                )}
              </span>
            </MobileButton>
          </div>

          {/* Compact Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                {t('auth.newHere', 'New here?')}
              </span>
            </div>
          </div>

          {/* Enhanced Navigation Links */}
          <div className="space-y-4">
            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center px-5 py-2.5 border-2 border-[#2b6cb0] text-[#2b6cb0] hover:bg-[#2b6cb0] hover:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#63b3ed] focus:ring-offset-2"
              >
                <span className="text-sm">{t('auth.noAccount')}</span>
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#2b6cb0] dark:text-gray-400 dark:hover:text-[#63b3ed] transition-colors duration-200 group"
              >
                <svg className="mr-1.5 w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};