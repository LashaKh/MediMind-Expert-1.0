import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain,
  FileText,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import type { PatientCase } from '../../types/chat';

interface ClinicalDashboardProps {
  recentCases?: PatientCase[];
  onCreateCase: () => void;
  specialtyConfig: {
    icon: React.ReactElement;
    title: string;
    gradient: string;
    bgGradient: string;
    accentColor: string;
    glowColor: string;
  };
  activeCase?: PatientCase;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  recentCases = [],
  onCreateCase,
  specialtyConfig,
  activeCase
}) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Quick actions based on specialty
  const getQuickActions = () => {
    const baseActions = [
      {
        title: t('chat.dashboard.quickConsult', 'Quick Consult'),
        description: t('chat.dashboard.quickConsultDesc', 'Ask AI about symptoms or treatments'),
        icon: Brain,
        action: () => {
          // Focus on the input area
          const textArea = document.querySelector('textarea[placeholder*="typeMessage"], textarea[placeholder*="Ask"]');
          if (textArea) {
            (textArea as HTMLTextAreaElement).focus();
          }
        },
        primary: true
      },
      {
        title: t('chat.dashboard.newCase', 'New Case Study'),
        description: t('chat.dashboard.newCaseDesc', 'Document and analyze a patient case'),
        icon: FileText,
        action: onCreateCase,
        primary: false
      }
    ];

    if (profile?.medical_specialty === 'cardiology') {
      return [
        ...baseActions,
        {
          title: t('chat.dashboard.bgConsult', 'BG Analysis'),
          description: t('chat.dashboard.bgConsultDesc', 'Upload and analyze blood gas'),
          icon: FileText,
          action: () => {
            navigate('/abg-analysis');
          },
          primary: false
        }
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  // If there's an active case, show case-ready view instead of quick actions
  if (activeCase) {
    return (
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          {/* Case Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className={`
              p-4 rounded-2xl bg-gradient-to-br ${specialtyConfig.gradient}
              shadow-xl shadow-${specialtyConfig.glowColor}/25 border border-white/20
            `}>
              <FileText className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
          </div>
          
          {/* Case Ready Message */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
              Case Ready for Discussion
            </h2>
            <div className={`
              inline-block px-4 py-2 rounded-lg 
              bg-gradient-to-r ${specialtyConfig.bgGradient} 
              border border-${specialtyConfig.accentColor}-200/60 
              shadow-md
            `}>
              <p className={`font-semibold text-${specialtyConfig.accentColor}-700`}>
                {activeCase.title}
              </p>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              I'm ready to discuss this case with you. Ask me anything about diagnosis, treatment options, 
              differential diagnosis, or any specific aspect of this case.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className={`
            p-4 rounded-2xl bg-gradient-to-br ${specialtyConfig.gradient}
            shadow-xl shadow-${specialtyConfig.glowColor}/25 border border-white/20
          `}>
            {React.cloneElement(specialtyConfig.icon, { 
              className: "w-8 h-8 text-white drop-shadow-sm" 
            })}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {`${t('chat.dashboard.welcomeBack')} ${profile?.full_name?.split(' ')[0] || 'Doctor'}`}
        </h2>
        <p className="text-slate-600">
          {`${t('chat.dashboard.subtitle')} ${profile?.medical_specialty === 'cardiology' ? 'cardiology' : 
                       profile?.medical_specialty === 'obgyn' ? 'OB/GYN' : 'medical'} practice today?`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`
                group relative p-6 rounded-2xl border-2 transition-all duration-300
                hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]
                ${action.primary 
                  ? `bg-gradient-to-br ${specialtyConfig.bgGradient} border-${specialtyConfig.accentColor}-200/60 shadow-lg shadow-${specialtyConfig.glowColor}/10`
                  : 'bg-white/60 border-slate-200/60 shadow-md hover:bg-white/80'
                }
                focus:outline-none focus:ring-4 focus:ring-${specialtyConfig.accentColor}-500/20
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  p-3 rounded-xl transition-all duration-300 group-hover:scale-110
                  ${action.primary 
                    ? `bg-gradient-to-br ${specialtyConfig.gradient} shadow-md`
                    : 'bg-slate-100 group-hover:bg-slate-200'
                  }
                `}>
                  <ActionIcon className={`w-6 h-6 ${action.primary ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-bold text-lg mb-1 ${action.primary ? `text-${specialtyConfig.accentColor}-700` : 'text-slate-700'}`}>
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};