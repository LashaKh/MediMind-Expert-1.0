import React, { useState } from 'react';
import { Lock, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { MedicalInput, MedicalButton, MedicalFormSection } from '../ui/MedicalFormComponents';

interface ChangePasswordFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);
    if (!formData.currentPassword) {
      setError(t('profile.currentPasswordRequired'));
      return false;
    }
    if (!formData.newPassword) {
      setError(t('profile.newPasswordRequired'));
      return false;
    }
    if (formData.newPassword === formData.currentPassword) {
      setError(t('profile.newPasswordDifferent'));
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccess(null);

    const [, error] = await safeAsync(
      async () => {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser.user?.email) {
          throw new Error(t('profile.noAuthenticatedUser'));
        }

        const response = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (response.error) {
          throw response.error;
        }

        return response.data;
      },
      {
        context: 'update user password',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setError(error.userMessage || t('profile.passwordUpdateFailed'));
    } else {
      setSuccess(t('profile.passwordUpdateSuccess'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
    
    setIsLoading(false);
  };

  return (
    <MedicalFormSection
      title={t('profile.changePassword')}
      subtitle={t('profile.keepAccountSecure')}
      icon={<Lock className="w-6 h-6" />}
      delay={0}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg">
            <p className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</p>
          </div>
        )}

        <MedicalInput
          label={t('profile.currentPassword')}
          type="password"
          value={formData.currentPassword}
          onChange={(value) => setFormData({ ...formData, currentPassword: value })}
          placeholder={t('profile.enterCurrentPassword')}
          required
          icon={<Lock className="w-5 h-5" />}
          delay={100}
        />
        
        <MedicalInput
          label={t('profile.newPassword')}
          type="password"
          value={formData.newPassword}
          onChange={(value) => setFormData({ ...formData, newPassword: value })}
          placeholder={t('profile.enterNewPassword')}
          required
          icon={<Lock className="w-5 h-5" />}
          delay={200}
        />
        
        <MedicalInput
          label={t('profile.confirmNewPassword')}
          type="password"
          value={formData.confirmPassword}
          onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
          placeholder={t('profile.confirmNewPasswordPlaceholder')}
          required
          icon={<Lock className="w-5 h-5" />}
          delay={300}
        />

        <div className="flex items-center space-x-4 pt-4">
          <MedicalButton
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            icon={<Save className="w-5 h-5" />}
            variant="success"
            size="lg"
            delay={400}
          >
            {t('profile.updatePassword')}
          </MedicalButton>
          
          {onClose && (
            <MedicalButton
              type="button"
              onClick={onClose}
              disabled={isLoading}
              icon={<X className="w-5 h-5" />}
              variant="secondary"
              size="lg"
              delay={500}
            >
              {t('profile.cancel')}
            </MedicalButton>
          )}
        </div>
      </form>
    </MedicalFormSection>
  );
};