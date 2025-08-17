import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTrialClick = () => {
    navigate('/signup'); // Always navigate to signup as auth is removed
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent py-16 md:py-32">
      <motion.div 
        className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="h-[20rem] w-[20rem] md:h-[40rem] md:w-[40rem] rounded-full bg-secondary/20 blur-3xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Stethoscope className="w-8 h-8 md:w-12 md:h-12 text-white" />
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white bg-clip-text">
              MediMind Expert
            </h1>
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-4xl font-bold text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('landing.heroTitle')}
          </motion.h2>
          <motion.p 
            className="text-base md:text-xl leading-relaxed text-gray-100 px-4 md:px-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t('landing.heroSubtitle')}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4 px-4 md:px-0"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button
              onClick={handleTrialClick}
              className="w-full sm:w-auto rounded-full bg-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold text-primary shadow-lg hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('landing.getStarted')}
              <ArrowRight className="inline-block ml-2 w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};