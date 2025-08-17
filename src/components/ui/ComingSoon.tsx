import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Clock, Star } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description, 
  features = [] 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-pink-900/70" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{ 
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.4, 0.8, 0.3, 0.4]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/30 to-blue-600/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -150, 200, 0],
            y: [0, 200, -100, 0],
            scale: [0.8, 1.3, 0.9, 0.8],
            opacity: [0.3, 0.6, 0.4, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-purple-400/25 to-pink-600/35 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-[3rem] blur-3xl opacity-60 scale-150" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-[3rem] blur-2xl opacity-50 scale-125" />
            
            <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 rounded-[3rem] shadow-2xl flex items-center justify-center border border-white/20">
              <Construction className="w-16 h-16 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-[3rem]" />
            </div>
          </motion.div>
          
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl lg:text-6xl font-black mb-6 tracking-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            {description}
          </motion.p>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg mb-12"
          >
            <Clock className="w-5 h-5" />
            <span>Coming Soon</span>
          </motion.div>

          {/* Features Preview */}
          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-6">What's Coming:</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;