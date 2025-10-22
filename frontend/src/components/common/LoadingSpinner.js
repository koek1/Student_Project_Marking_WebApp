import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/helpers';

// LoadingSpinner component for displaying loading states - Supports different sizes and styles
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = null,
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-akademia-primary',
    secondary: 'text-akademia-secondary',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  const spinnerElement = (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-screen',
      className
    )}>
      <div className="text-center">
        <Loader2 className={cn(
          'animate-spin mx-auto',
          sizeClasses[size],
          colorClasses[color]
        )} />
        {text && (
          <p className={cn(
            'mt-2 text-sm',
            color === 'white' ? 'text-white' : 'text-gray-600'
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return spinnerElement;
};

export default LoadingSpinner;