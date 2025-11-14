import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Button } from './Button';

interface InstallPWAProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const InstallPWA: React.FC<InstallPWAProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      console.log('App installation accepted');
    }
  };

  // Don't show the button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={handleInstallClick}
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Install App
    </Button>
  );
};
