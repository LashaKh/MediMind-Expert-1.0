import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  variant?: 'large' | 'medium' | 'small';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  delay,
  variant = 'medium'
}) => {
  const variants = {
    large: "col-span-2 row-span-2 p-8",
    medium: "col-span-1 row-span-2 p-6",
    small: "col-span-1 row-span-1 p-6"
  };

  return (
    <motion.div 
      className={`
        group relative overflow-hidden
        bg-gradient-to-br from-white to-gray-50
        dark:from-gray-800 dark:to-gray-900
        rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-300
        ${variant === 'large' ? 'col-span-1 sm:col-span-2' : 'col-span-1'}
        ${variant === 'medium' ? 'row-span-2' : 'row-span-1'}
      `}
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-grid-white pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div 
          className={`
            mb-6
            inline-flex items-center justify-center
            rounded-xl bg-primary/10 dark:bg-primary/20
            p-4 group-hover:scale-110 group-hover:rotate-3
            transition-transform duration-300
          `}
        >
          <Icon className={`
            h-8 w-8
            text-primary
          `} />
        </motion.div>

        <h3 className={`
          text-xl mb-3
          font-semibold text-gray-900 dark:text-white
        `}>
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Hover Effect Gradient */}
        <div className="
          absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0
          dark:from-primary/0 dark:via-primary/10 dark:to-primary/0
          translate-x-[-100%] group-hover:translate-x-[100%]
          transition-transform duration-1000
        " />
      </div>
    </motion.div>
  );
};