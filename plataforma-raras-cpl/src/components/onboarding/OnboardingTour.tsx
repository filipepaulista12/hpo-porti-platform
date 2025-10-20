/**
 * OnboardingTour Component
 * Interactive tutorial shown to new users on first login
 */

import React, { useState, useEffect } from 'react';
import { ONBOARDING_STEPS, type OnboardingStep } from './onboarding-steps';
import './onboarding.css';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  const step = ONBOARDING_STEPS[currentStep];

  // Calculate popover position based on target element
  useEffect(() => {
    if (!step || step.target === 'center') {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(step.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      const rect = element.getBoundingClientRect();
      const popoverWidth = 400;
      const popoverHeight = 250;
      const gap = 20;

      let top = 0;
      let left = 0;

      switch (step.placement) {
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + (rect.width / 2) - (popoverWidth / 2);
          break;
        case 'top':
          top = rect.top - popoverHeight - gap;
          left = rect.left + (rect.width / 2) - (popoverWidth / 2);
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (popoverHeight / 2);
          left = rect.right + gap;
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (popoverHeight / 2);
          left = rect.left - popoverWidth - gap;
          break;
      }

      // Ensure popover stays within viewport
      top = Math.max(20, Math.min(top, window.innerHeight - popoverHeight - 20));
      left = Math.max(20, Math.min(left, window.innerWidth - popoverWidth - 20));

      setPopoverPosition({ top, left });
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible || !step) return null;

  const isCenter = step.target === 'center';

  return (
    <>
      {/* Dark overlay */}
      <div className="onboarding-overlay" onClick={handleSkip} />
      
      {/* Spotlight on target element */}
      {targetElement && (
        <div
          className="onboarding-spotlight"
          style={{
            top: targetElement.getBoundingClientRect().top - 5,
            left: targetElement.getBoundingClientRect().left - 5,
            width: targetElement.getBoundingClientRect().width + 10,
            height: targetElement.getBoundingClientRect().height + 10,
          }}
        />
      )}
      
      {/* Popover with content */}
      <div
        className={`onboarding-popover ${isCenter ? 'center' : step.placement}`}
        style={isCenter ? {} : { top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="onboarding-header">
          <h3>
            {step.icon && <span className="step-icon">{step.icon}</span>}
            {step.title}
          </h3>
          {step.showSkip !== false && (
            <button 
              className="skip-btn" 
              onClick={handleSkip}
              title="Pular tour"
            >
              Pular
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="onboarding-content">
          <p>{step.content}</p>
        </div>
        
        {/* Footer */}
        <div className="onboarding-footer">
          {/* Step indicators */}
          <div className="step-indicators">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`indicator ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(i)}
                title={`Passo ${i + 1}`}
              />
            ))}
          </div>
          
          {/* Progress text */}
          <div className="step-progress">
            {currentStep + 1} de {ONBOARDING_STEPS.length}
          </div>
          
          {/* Navigation buttons */}
          <div className="step-buttons">
            {currentStep > 0 && (
              <button 
                className="btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Anterior
              </button>
            )}
            
            <button 
              className="btn-primary"
              onClick={handleNext}
            >
              {step.ctaText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
