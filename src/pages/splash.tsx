import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, sleep } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Plane, Globe, Users, FileText, CheckCircle, Rocket } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      title: 'Welcome to VisaMOTion',
      description: 'Bangladesh-based visa consultancy platform',
      icon: <Globe className="h-12 w-12 text-primary-600" />,
      color: 'bg-primary-50',
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Chat with AI in Bengali and English',
      icon: <Users className="h-12 w-12 text-primary-600" />,
      color: 'bg-primary-100',
    },
    {
      title: 'Complete Visa Solutions',
      description: 'Manage applications, documents, and cases',
      icon: <FileText className="h-12 w-12 text-primary-600" />,
      color: 'bg-primary-50',
    },
    {
      title: 'Professional PDF Generation',
      description: 'Create, edit, and download case documents',
      icon: <CheckCircle className="h-12 w-12 text-primary-600" />,
      color: 'bg-primary-100',
    },
    {
      title: 'Ready to Launch',
      description: 'Start managing your visa operations',
      icon: <Rocket className="h-12 w-12 text-primary-600" />,
      color: 'bg-primary-50',
    },
  ];

  // Animation sequence
  useEffect(() => {
    const animateSequence = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        await sleep(800); // Animation duration
        if (i < steps.length - 1) {
          await sleep(500); // Pause between steps
        }
      }
      await sleep(500);
      setIsAnimating(false);
    };

    animateSequence();
  }, [steps.length]);

  // Complete animation
  const handleComplete = async () => {
    setIsAnimating(true);
    await sleep(300);
    onComplete();
    navigate('/');
  };

  // Skip animation
  const handleSkip = () => {
    onSkip();
    navigate('/');
  };

  const currentStepData = steps[currentStep];

  // Step animations
  const stepVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 20, stiffness: 100 }
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      scale: 0.8,
      transition: { duration: 0.3 }
    },
  };

  // Icon animations
  const iconVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring', damping: 15, stiffness: 150 }
    },
  };

  // Background animations
  const bgVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 1.5, ease: 'easeInOut' }
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
      {/* Background pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        variants={bgVariants}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 0.5px, transparent 0.5px),
                            radial-gradient(circle at 80% 20%, white 0.5px, transparent 0.5px),
                            radial-gradient(circle at 40% 40%, white 0.5px, transparent 0.5px)`,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px',
        }} />
      </motion.div>

      {/* Animated circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-white/10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-white/10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-white/5"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              variants={iconVariants}
              className={cn(
                'flex items-center justify-center h-24 w-24 rounded-2xl mb-6 mx-auto',
                currentStepData.color
              )}
            >
              {currentStepData.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-primary-100 text-sm md:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentStepData.description}
            </motion.p>

            {/* Progress dots */}
            <motion.div
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    index === currentStep ? 'bg-white' : 'bg-white/30'
                  )}
                  animate={{
                    scale: index === currentStep ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isAnimating ? (
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Skip
            </Button>
          ) : (
            <>
              <Button
                onClick={handleComplete}
                className="w-full bg-white text-primary-600 hover:bg-primary-50"
                leftIcon={<Rocket className="h-4 w-4" />}
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-white hover:bg-white/10"
              >
                Skip
              </Button>
            </>
          )}
        </motion.div>

        {/* Loading indicator */}
        {isAnimating && (
          <motion.div
            className="flex justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex gap-1">
              <motion.div
                className="h-2 w-2 rounded-full bg-white/50"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-white/50"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-white/50"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/60 text-xs md:text-sm">
          {APP_CONFIG.company} &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
