import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { MobileInput, MobileButton } from '../ui/mobile-form';
import { useAuth } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithPassword } = useAuth();
  const { t } = useTranslation();

  const signUpSchema = z.object({
    name: z.string().min(2, { message: t('validation.nameMinLength') }),
    email: z.string().email({ message: t('validation.invalidEmail') }),
    password: z.string().min(1, { message: t('validation.passwordRequired') }),
    confirmPassword: z.string().min(1, { message: t('validation.confirmPasswordRequired') }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'], // path of error
  });

  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    const [result, error] = await safeAsync(
      () => signUpWithPassword({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      }),
      {
        context: 'user sign up',
        severity: ErrorSeverity.HIGH,
        showToast: true
      }
    );

    if (error) {
      // Set form-level errors based on the error type
      const errorMessage = error.originalError?.message || error.message;
      if (errorMessage.includes('User already registered')) {
        setError('email', { message: t('auth.errors.emailExists') });
      } else if (errorMessage.includes('Password should be at least')) {
        setError('password', { message: t('auth.errors.weakPassword') });
      } else if (errorMessage.includes('Invalid email')) {
        setError('email', { message: t('validation.invalidEmail') });
      } else {
        setError('email', { message: t('auth.errors.signUpFailed') });
      }
      return;
    }

    navigate('/'); 
  };

  return (
    <AuthLayout title={t('auth.signUpTitle')}>
      <div className="px-2 sm:px-4">
        <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 sm:space-y-5">
            {/* Full Name Input */}
            <MobileInput
              id="name"
              type="text"
              label={t('auth.fullNameLabel')}
              placeholder={t('auth.fullNamePlaceholder')}
              autoComplete="name"
              icon={User}
              error={errors.name?.message}
              disabled={isSubmitting}
              required
              {...register('name')}
            />

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
              placeholder={t('auth.createPasswordPlaceholder')}
              autoComplete="new-password"
              icon={Lock}
              error={errors.password?.message}
              disabled={isSubmitting}
              required
              hint={t('auth.passwordHint')}
              {...register('password')}
            />

            {/* Confirm Password Input */}
            <MobileInput
              id="confirmPassword"
              type="password"
              label={t('auth.confirmPasswordLabel')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              autoComplete="new-password"
              icon={ShieldCheck}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
              required
              {...register('confirmPassword')}
            />
          </div>

          {/* Terms and Privacy Notice */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <p className="leading-relaxed">
              {t('auth.termsNotice')}
            </p>
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
              {isSubmitting ? t('auth.signingUp') : t('auth.createAccount')}
            </MobileButton>
          </div>

          {/* Navigation Link */}
          <div className="text-center pt-2">
            <div className="text-sm sm:text-base">
              <Link
                to="/signin"
                className="inline-block font-medium text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/90 transition-colors duration-200 touch-target-md px-4 py-2 rounded-lg focus-enhanced"
              >
                {t('auth.haveAccount')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};