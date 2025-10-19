import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Calendar, 
  Briefcase, 
  MapPin,
  Award,
  TrendingUp,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Star
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { 
  useCardEntranceAnimation,
  useMagneticHover, 
  useParticleAnimation,
  useAnimatedCounter,
  useTouchRipple 
} from '../../hooks/useAdvancedAnimations';
import type { Database } from '../../types/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface ProfileHeroProps {
  profile: UserProfile | null;
  formData: {
    full_name: string;
    medical_specialty: string;
    about_me_context: string;
  };
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (field: string, value: string) => void;
  onProfilePictureUpdate: (imageUrl: string | null) => void;
}

const medicalSpecialtyIcons = {
  'cardiology': Heart,
  'ob-gyn': Activity,
  'internal-medicine': Stethoscope,
  'emergency-medicine': Activity,
  'pediatrics': Heart,
  'surgery': Activity,
  'family-medicine': Stethoscope,
  'psychiatry': Brain,
  'radiology': Activity,
  'anesthesiology': Activity,
  'other': Stethoscope
};

const medicalSpecialtyGradients = {
  'cardiology': 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
  'ob-gyn': 'from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4]',
  'internal-medicine': 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
  'emergency-medicine': 'from-[#2b6cb0] via-[#1a365d] to-[#63b3ed]',
  'pediatrics': 'from-[#63b3ed] via-[#2b6cb0] to-[#1a365d]',
  'surgery': 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
  'family-medicine': 'from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4]',
  'psychiatry': 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
  'radiology': 'from-[#63b3ed] via-[#2b6cb0] to-[#1a365d]',
  'anesthesiology': 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
  'other': 'from-[#2b6cb0] via-[#1a365d] to-[#63b3ed]'
};

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  formData,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  onProfilePictureUpdate
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Animation hooks
  const { elementRef: heroRef } = useCardEntranceAnimation(0);
  const magneticButtonRef = useMagneticHover();
  const { containerRef: particleRef, particles } = useParticleAnimation(15);
  const { elementRef: counterRef, currentValue: profileCompletionValue } = useAnimatedCounter(
    Math.round((([formData.full_name, formData.medical_specialty, formData.about_me_context, profile?.profile_picture_url].filter(Boolean).length) / 4) * 100),
    2000
  );
  const touchRippleRef = useTouchRipple();

  const [isHovering, setIsHovering] = useState(false);

  const specialtyKey = profile?.medical_specialty as keyof typeof medicalSpecialtyIcons;
  const SpecialtyIcon = medicalSpecialtyIcons[specialtyKey] || Stethoscope;
  const specialtyGradient = medicalSpecialtyGradients[specialtyKey] || medicalSpecialtyGradients.other;

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

  return (
    <div className="relative mb-8 perspective-2000">
      {/* Particle Background System */}
      <div 
        ref={particleRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#63b3ed]/20 rounded-full animate-medical-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-[#63b3ed] to-[#90cdf4] rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 via-transparent to-[#1a365d]/10 rounded-3xl blur-3xl animate-professional-gradient" />
      
      {/* Main Hero Card */}
      <div
        ref={heroRef}
        className="relative medical-glass hw-accelerate overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated Border Glow */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
          isHovering 
            ? 'bg-gradient-to-r from-[#2b6cb0]/20 via-[#63b3ed]/20 to-[#90cdf4]/20 animate-professional-gradient' 
            : 'bg-transparent'
        }`} />

        {/* Content Container */}
        <div className="relative p-8 lg:p-12 hw-accelerate">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            
            {/* Enhanced Profile Picture Section */}
            <div className="relative group">
              {/* Floating Medical Icons */}
              <div className="absolute -inset-8 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 text-[#63b3ed]/30 animate-medical-particle">
                  <Heart className="w-full h-full" />
                </div>
                <div 
                  className="absolute top-2 right-0 w-5 h-5 text-[#2b6cb0]/30 animate-medical-particle"
                  style={{ animationDelay: '1s' }}
                >
                  <Activity className="w-full h-full" />
                </div>
                <div 
                  className="absolute bottom-0 left-2 w-4 h-4 text-[#90cdf4]/30 animate-medical-particle"
                  style={{ animationDelay: '2s' }}
                >
                  <Stethoscope className="w-full h-full" />
                </div>
              </div>

              {/* Glowing Ring Animation */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4] animate-professional-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
              
              {/* Profile Picture Container */}
              <div className="relative medical-avatar hw-accelerate">
                <ProfilePictureUpload
                  currentImageUrl={profile?.profile_picture_url}
                  onImageUpdate={onProfilePictureUpdate}
                />
                
                {/* Achievement Badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] rounded-full flex items-center justify-center shadow-lg animate-medical-badge-glow">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Profile Information Section */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Name and Title Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="medical-heading-1 animate-gradient-text">
                    {formData.full_name || t('profile.noNameSet')}
                  </h1>
                  
                  {/* Professional Subtitle */}
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t('profile.memberSince')} {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : t('profile.unknown')}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Specialty Badge */}
                {profile?.medical_specialty && (
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r ${specialtyGradient} rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 group`}>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <SpecialtyIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-white font-medium text-sm uppercase tracking-wide">
                        {medicalSpecialties.find(s => s.value === profile.medical_specialty)?.label}
                      </span>
                      <div className="text-white/80 text-xs">{t('profile.medicalSpecialistSubtitle')}</div>
                    </div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-live-pulse" />
                  </div>
                )}

                {/* Professional Stats Row */}
                <div className="flex items-center space-x-6">
                  {/* Profile Completion */}
                  <div ref={counterRef} className="flex items-center space-x-2">
                    <div className="w-12 h-12 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200 dark:text-gray-700"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          className="text-[#2b6cb0] transition-all duration-1000 ease-out"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${profileCompletionValue}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {profileCompletionValue}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('profile.profileCompleteStat')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.professionalSetup')}</div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#63b3ed] rounded-full animate-live-pulse" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('profile.verified')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.professionalAccount')}</div>
                    </div>
                  </div>

                  {/* Achievement Count */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#63b3ed] to-[#2b6cb0] rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">8</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.achievements')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <button
                  ref={magneticButtonRef}
                  onClick={onEdit}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] hover:from-[#1a365d] hover:to-[#2b6cb0] text-white rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-button-magnetic hw-accelerate"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2 z-10">
                    <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">{t('profile.editProfile')}</span>
                  </div>
                  
                  {/* Ripple Effect Container */}
                  <div ref={touchRippleRef} className="absolute inset-0 overflow-hidden rounded-2xl" />
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hw-accelerate"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center space-x-2 z-10">
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{isSaving ? t('profile.saving') : t('profile.saveChanges')}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="group relative overflow-hidden px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hw-accelerate"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center space-x-2 z-10">
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">{t('profile.cancel')}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Tagline */}
          {formData.about_me_context && (
            <div className="mt-6 p-4 bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-700/30">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                "{formData.about_me_context.slice(0, 120)}{formData.about_me_context.length > 120 ? '...' : ''}"
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="absolute bottom-6 right-6 lg:hidden">
          <button
            onClick={isEditing ? onSave : onEdit}
            disabled={isSaving}
            className={`w-14 h-14 ${
              isEditing 
                ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                : 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]'
            } text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:shadow-3xl hw-accelerate disabled:opacity-50`}
          >
            {isEditing ? (
              <Save className="w-6 h-6" />
            ) : (
              <Edit className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};