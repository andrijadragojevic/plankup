import React, { useState } from 'react';
import { FaDumbbell, FaCalendarAlt, FaChartLine, FaFire } from 'react-icons/fa';
import { Button } from './Button';
import { Modal } from './Modal';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  canSkip?: boolean;
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to PlankUP!',
    description:
      'Build core strength progressively with daily plank exercises. Start where you are, improve every day.',
    icon: <FaDumbbell className="text-6xl text-primary-500" />,
  },
  {
    id: 2,
    title: 'Baseline Assessment',
    description:
      'First, complete 3 baseline plank sessions to measure your starting point. Hold your plank as long as you can!',
    icon: <FaCalendarAlt className="text-6xl text-accent-500" />,
  },
  {
    id: 3,
    title: 'Progressive Training',
    description:
      'After baseline, we\'ll set your daily target. Each day, your target increases by 3 seconds (customizable in settings).',
    icon: <FaChartLine className="text-6xl text-primary-500" />,
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description:
      'Build streaks, track your progress, and watch yourself get stronger. Consistency is key!',
    icon: <FaFire className="text-6xl text-accent-500" />,
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({
  isOpen,
  onComplete,
  canSkip = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} showCloseButton={false} size="lg">
      <div className="py-8">
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-gradient-to-r from-primary-500 to-accent-500'
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-12 min-h-[300px] flex flex-col items-center justify-center">
          <div className="mb-6 animate-bounce">{step.icon}</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">{step.title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                aria-label="Previous step"
              >
                Previous
              </Button>
            ) : (
              canSkip && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  aria-label="Skip onboarding"
                >
                  Skip
                </Button>
              )
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            aria-label={
              currentStep < onboardingSteps.length - 1
                ? 'Next step'
                : 'Start using PlankUP'
            }
          >
            {currentStep < onboardingSteps.length - 1 ? 'Next' : "Let's Start!"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
