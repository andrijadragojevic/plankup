import React from 'react';
import { FaTrophy, FaFire, FaClock } from 'react-icons/fa';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatDuration } from '../utils/dateUtils';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  streak: number;
  isNewBest?: boolean;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  duration,
  streak,
  isNewBest = false,
}) => {
  const encouragementMessages = [
    'Awesome work!',
    'You crushed it!',
    'Amazing job!',
    'Keep it up!',
    'Fantastic effort!',
    'You\'re getting stronger!',
  ];

  const randomMessage =
    encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center py-8">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-bounce">
            <FaTrophy className="text-5xl text-white" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 mb-4">
          {randomMessage}
        </h2>

        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Plank session completed successfully!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl p-4">
            <FaClock className="text-2xl text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatDuration(duration)}
            </div>
            <div className="text-sm text-primary-600/70 dark:text-primary-400/70 mt-1">Time</div>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 rounded-xl p-4">
            <FaFire className="text-2xl text-accent-600 dark:text-accent-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">{streak}</div>
            <div className="text-sm text-accent-600/70 dark:text-accent-400/70 mt-1">
              Day Streak
            </div>
          </div>
        </div>

        {isNewBest && (
          <div className="mb-6 px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full font-semibold inline-block">
            New Personal Best!
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
