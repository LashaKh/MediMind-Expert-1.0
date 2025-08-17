import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  Database, 
  Stethoscope
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { useTranslation } from '../../hooks/useTranslation';

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Brain,
      title: t('landing.features.aiCoPilot.title'),
      description: t('landing.features.aiCoPilot.description'),
      variant: 'large' as const
    },
    {
      icon: Database,
      title: t('landing.features.knowledgeAccess.title'),
      description: t('landing.features.knowledgeAccess.description'),
      variant: 'large' as const
    },
    {
      icon: Shield,
      title: t('landing.features.personalKB.title'),
      description: t('landing.features.personalKB.description'),
      variant: 'medium' as const
    },
    {
      icon: Stethoscope,
      title: t('landing.features.specialtyTools.title'),
      description: t('landing.features.specialtyTools.description'),
      variant: 'medium' as const
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
              variant={feature.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
};