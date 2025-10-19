import React, { useState, useEffect } from 'react';
import { User, Edit, X, Lock, Settings, Badge, Award, TrendingUp, Activity, Clock, BookOpen, Shield, Stethoscope, Heart, Brain, Sparkles } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { supabase } from '../../lib/supabase';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { ProfileHero } from './ProfileHero';
import { ProfileStatsDashboard } from './ProfileStatsDashboard';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { 
  MedicalInput, 
  MedicalSelect, 
  MedicalTextarea, 
  MedicalButton, 
  MedicalFormSection 
} from '../ui/MedicalFormComponents';
import type { Database } from '../../types/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

type ProfileTab = 'profile' | 'security' | 'preferences';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    medical_specialty: '',
    about_me_context: ''
  });

  const medicalSpecialties = [
    { value: '', label: t('profile.selectSpecialty') },
    { value: 'cardiology', label: t('profile.cardiology') },
    { value: 'ob-gyn', label: t('profile.obgyn') },
    { value: 'internal-medicine', label: t('profile.internalMedicine') },
    { value: 'emergency-medicine', label: t('profile.emergencyMedicine') },
    { value: 'pediatrics', label: t('profile.pediatrics') },
    { value: 'surgery', label: t('profile.surgery') },
    { value: 'family-medicine', label: t('profile.familyMedicine') },
    { value: 'psychiatry', label: t('profile.psychiatry') },
    { value: 'radiology', label: t('profile.radiology') },
    { value: 'anesthesiology', label: t('profile.anesthesiology') },
    { value: 'other', label: t('profile.other') }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    
    if (!user?.id) {
      setError(t('profile.userNotAuthenticated'));
      setIsLoading(false);
      return;
    }

    const [data, error] = await safeAsync(
      async () => {
        const response = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (response.error) throw response.error;
        return response.data;
      },
      {
        context: 'fetch user profile',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setError(t('profile.failedToLoadProfile'));
    } else {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        medical_specialty: data.medical_specialty || '',
        about_me_context: data.about_me_context || ''
      });
    }
    
    setIsLoading(false);
  };

  const validateForm = () => {
    if (formData.full_name && formData.full_name.trim().length < 2) {
      setError(t('profile.nameMinLength'));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      setIsSaving(false);
      return;
    }

    if (!user?.id) {
      setError(t('profile.userNotAuthenticated'));
      setIsSaving(false);
      return;
    }

    const [, error] = await safeAsync(
      async () => {
        const response = await supabase
          .from('users')
          .update({
            full_name: formData.full_name?.trim() || null,
            medical_specialty: formData.medical_specialty || null,
            about_me_context: formData.about_me_context?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (response.error) throw response.error;
        return response.data;
      },
      {
        context: 'update user profile',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setError(t('profile.updateError'));
    } else {
      setSuccess(t('profile.updateSuccess'));
      setIsEditing(false);
      await fetchProfile(); // Refresh the profile data
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      medical_specialty: profile?.medical_specialty || '',
      about_me_context: profile?.about_me_context || ''
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureUpdate = (imageUrl: string | null) => {
    if (profile) {
      setProfile({ ...profile, profile_picture_url: imageUrl });
    }
  };

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('profile.profileInfo'), icon: <User className="w-4 h-4" /> },
    { id: 'security', label: t('profile.security'), icon: <Lock className="w-4 h-4" /> },
    { id: 'preferences', label: t('profile.preferences'), icon: <Settings className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-gray-900 dark:via-slate-900 dark:to-[#1a365d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#90cdf4]/50 to-[#63b3ed]/50 dark:from-[#2b6cb0] to-[#1a365d] rounded-2xl animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-64"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-48"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-32"></div>
                </div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white/80 dark:bg-gray-800/80 rounded-2xl animate-pulse"></div>
                <div className="h-48 bg-white/80 dark:bg-gray-800/80 rounded-2xl animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-white/80 dark:bg-gray-800/80 rounded-2xl animate-pulse"></div>
                <div className="h-24 bg-white/80 dark:bg-gray-800/80 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-gray-900 dark:via-slate-900 dark:to-[#1a365d] transition-all duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error/Success Messages - Floating */}
        {error && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-red-500/90 backdrop-blur-xl border border-red-400/20 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-top-5">
            <p className="text-white font-medium flex items-center space-x-2">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {success && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-emerald-500/90 backdrop-blur-xl border border-emerald-400/20 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-top-5">
            <p className="text-white font-medium flex items-center space-x-2">
              <Badge className="w-4 h-4" />
              <span>{success}</span>
            </p>
          </div>
        )}

        {/* Enhanced Hero Profile Header */}
        <ProfileHero
          profile={profile}
          formData={formData}
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onFormChange={handleFormChange}
          onProfilePictureUpdate={handleProfilePictureUpdate}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation - Vertical */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.settings')}</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 hover:transform hover:translate-x-1'
                    }`}
                  >
                    <div className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-[#2b6cb0]'} transition-colors duration-300`}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('profile.profileStats')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#90cdf4]/30 dark:bg-[#2b6cb0]/30 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.profileComplete')}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#2b6cb0] dark:text-[#63b3ed]">
                    {Math.round((([formData.full_name, formData.medical_specialty, formData.about_me_context, profile?.profile_picture_url].filter(Boolean).length) / 4) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#63b3ed]/30 dark:bg-[#2b6cb0]/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.securityScore')}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#2b6cb0] dark:text-[#63b3ed]">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#90cdf4]/30 dark:bg-[#63b3ed]/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#1a365d] dark:text-[#90cdf4]" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('profile.lastActive')}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">{t('profile.now')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {activeTab === 'profile' && (
              <div className="p-8 space-y-8">
                {/* Enhanced Personal Information Section */}
                <MedicalFormSection
                  title={t('profile.personalInformationTitle')}
                  subtitle={t('profile.personalInformationSubtitle')}
                  icon={<User className="w-6 h-6" />}
                  delay={0}
                >
                  <div className="space-y-6">
                    {isEditing ? (
                      <MedicalInput
                        label={t('profile.fullName')}
                        type="text"
                        value={formData.full_name}
                        onChange={(value) => handleFormChange('full_name', value)}
                        placeholder={t('profile.enterFullName')}
                        required
                        icon={<User className="w-5 h-5" />}
                        delay={100}
                      />
                    ) : (
                      <div className="p-6 medical-glass rounded-2xl">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('profile.fullName')}
                          </label>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {profile?.full_name || <span className="text-gray-500 italic">{t('profile.notSet')}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </MedicalFormSection>

                {/* Enhanced Professional Details Section */}
                <MedicalFormSection
                  title={t('profile.professionalDetailsTitle')}
                  subtitle={t('profile.professionalDetailsSubtitle')}
                  icon={<Stethoscope className="w-6 h-6" />}
                  delay={200}
                >
                  <div className="space-y-6">
                    {isEditing ? (
                      <MedicalSelect
                        label={t('profile.medicalSpecialty')}
                        value={formData.medical_specialty}
                        onChange={(value) => handleFormChange('medical_specialty', value)}
                        options={medicalSpecialties.map(specialty => ({
                          value: specialty.value,
                          label: specialty.label,
                          icon: specialty.value === 'cardiology' ? <Heart className="w-4 h-4" /> :
                                specialty.value === 'ob-gyn' ? <Activity className="w-4 h-4" /> :
                                specialty.value === 'psychiatry' ? <Brain className="w-4 h-4" /> :
                                <Stethoscope className="w-4 h-4" />
                        }))}
                        placeholder={t('profile.selectSpecialty')}
                        required
                        delay={300}
                      />
                    ) : (
                      <div className="p-6 medical-glass rounded-2xl">
                        <div className="flex items-center space-x-3 mb-2">
                          <Stethoscope className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('profile.medicalSpecialty')}
                          </label>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {medicalSpecialties.find(s => s.value === profile?.medical_specialty)?.label || 
                           <span className="text-gray-500 italic">{t('profile.notSet')}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </MedicalFormSection>

                {/* Enhanced About Me Section */}
                <MedicalFormSection
                  title={t('profile.aboutMeTitle')}
                  subtitle={t('profile.aboutMeSubtitle')}
                  icon={<BookOpen className="w-6 h-6" />}
                  delay={400}
                >
                  <div className="space-y-6">
                    {isEditing ? (
                      <MedicalTextarea
                        label={t('profile.aboutMe')}
                        value={formData.about_me_context}
                        onChange={(value) => handleFormChange('about_me_context', value)}
                        placeholder={t('profile.aboutMePlaceholder')}
                        rows={6}
                        maxLength={500}
                        delay={500}
                      />
                    ) : (
                      <div className="p-6 medical-glass rounded-2xl min-h-[200px]">
                        <div className="flex items-center space-x-3 mb-4">
                          <BookOpen className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('profile.professionalContext')}
                          </label>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                          <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                            {profile?.about_me_context || (
                              <span className="text-gray-500 dark:text-gray-400 italic">
                                {t('profile.notSetAboutMe')}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </MedicalFormSection>

              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#63b3ed]/30 dark:bg-[#2b6cb0]/30 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#2b6cb0] dark:text-[#63b3ed]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.securitySettings')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{t('profile.keepAccountSecure')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                    <ChangePasswordForm
                      onSuccess={() => {
                        setSuccess(t('profile.passwordUpdateSuccess'));
                        setTimeout(() => setSuccess(null), 3000);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-8">
                <MedicalFormSection
                  title={t('profile.preferences')}
                  subtitle={t('profile.preferencesDesc')}
                  icon={<Settings className="w-6 h-6" />}
                  delay={0}
                >
                  {/* Enhanced Coming Soon with Professional Design */}
                  <div className="relative text-center">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 via-transparent to-[#63b3ed]/10 rounded-3xl blur-3xl animate-professional-gradient" />
                    
                    {/* Content */}
                    <div className="relative py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform transition-transform duration-500 hover:scale-110 hover:rotate-12">
                        <Settings className="w-12 h-12 text-white animate-spin-slow" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 animate-gradient-text">
                        {t('profile.comingSoon')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                        {t('profile.preferencesDesc')}
                      </p>
                      
                      {/* Animated Preview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {/* Display Card */}
                        <div className="relative p-6 medical-glass rounded-2xl overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="w-12 h-12 bg-[#2b6cb0]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#2b6cb0]/20 transform transition-transform duration-300 group-hover:scale-110">
                            <User className="w-6 h-6 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('profile.display')}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.themeLayout')}</p>
                        </div>

                        {/* Notifications Card */}
                        <div className="relative p-6 medical-glass rounded-2xl overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#63b3ed]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="w-12 h-12 bg-[#63b3ed]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#63b3ed]/20 transform transition-transform duration-300 group-hover:scale-110">
                            <Activity className="w-6 h-6 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('profile.notifications')}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.alertsUpdates')}</p>
                        </div>
                        
                        {/* AI Assistant Card */}
                        <div className="relative p-6 medical-glass rounded-2xl overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="w-12 h-12 bg-[#2b6cb0]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#2b6cb0]/20 transform transition-transform duration-300 group-hover:scale-110">
                            <Sparkles className="w-6 h-6 text-[#2b6cb0] dark:text-[#63b3ed]" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('profile.aiAssistant')}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.personalization')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </MedicalFormSection>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-14 h-14 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:shadow-3xl"
        >
          {isEditing ? (
            <X className="w-6 h-6" />
          ) : (
            <Edit className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};