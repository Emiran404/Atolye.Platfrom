import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from './Button';

const OnboardingTour = ({ steps, onComplete, onStepChange, tourKey = 'teacher-onboarding-done', forceShow = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [popoverAbove, setPopoverAbove] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const isDone = localStorage.getItem(tourKey);
    if (!isDone || forceShow) {
      // Delay slightly for initial layout
      const timer = setTimeout(() => setIsVisible(true), forceShow ? 100 : 1000);
      return () => clearTimeout(timer);
    }
  }, [tourKey, forceShow]);

  // Listen for automatic tour completion from components
  useEffect(() => {
    const handleAutoFinish = () => {
      if (isVisible) {
        handleComplete();
      }
    };

    window.addEventListener('finish-onboarding-tour', handleAutoFinish);
    return () => window.removeEventListener('finish-onboarding-tour', handleAutoFinish);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const updatePosition = () => {
        const element = document.getElementById(steps[currentStep].targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Use viewport coords (no scrollY/scrollX) since overlay container is fixed
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, currentStep, steps]);

  // Smart scroll: if element is fixed (e.g. sidebar), scroll page to top;
  // otherwise scroll the element into view.
  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        const style = window.getComputedStyle(element);
        const position = style.position;
        if (position === 'fixed' || element.closest('[style*="position: fixed"]') || element.closest('.teacher-sidebar')) {
          // Sidebar/fixed element — scroll page back to top so popover is visible
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [isVisible, currentStep]);

  // Handle button delay and step change notification
  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      if (onStepChange) onStepChange(currentStep);

      const delay = steps[currentStep].hideButtonDuration;
      if (delay) {
        setIsButtonVisible(false);
        const timer = setTimeout(() => setIsButtonVisible(true), delay);
        return () => clearTimeout(timer);
      } else {
        setIsButtonVisible(true);
      }
    }
  }, [isVisible, currentStep, steps, onStepChange]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem(tourKey, 'true');
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  const currentStatus = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">


      {/* Dynamic SVG Overlay / Spotlight with Soft Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="spotlight-blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={coords.left - 6}
              y={coords.top - 6}
              width={coords.width + 12}
              height={coords.height + 12}
              rx="16"
              fill="black"
              filter="url(#spotlight-blur)"
              className={`transition-all duration-500 ${currentStatus.zoom ? 'spotlight-active' : ''}`}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center'
              }}
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
          style={{ backdropFilter: 'blur(2px)' }}
          className="transition-all duration-500"
        />
      </svg>

      {/* Popover Card */}
      <div
        ref={popoverRef}
        className="absolute p-6 bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto transition-all duration-300 animate-in fade-in zoom-in-95"
        style={(() => {
          const popoverWidth = 320;
          const popoverGap = 16;
          const popoverHeight = 240;
          const spaceAbove = coords.top;
          const isAbove = spaceAbove >= popoverHeight + popoverGap;

          const top = isAbove
            ? coords.top - popoverHeight - popoverGap
            : coords.top + coords.height + popoverGap;

          const left = Math.min(
            Math.max(20, coords.left + coords.width - popoverWidth),
            window.innerWidth - popoverWidth - 20
          );

          // Update arrow direction state (deferred to avoid render-during-render)
          setTimeout(() => setPopoverAbove(isAbove), 0);

          return { top, left, width: `${popoverWidth}px` };
        })()}
      >
        {/* Progress Dots */}
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleComplete}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {currentStatus.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {currentStatus.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && !steps[currentStep].hideBackButton && (
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ChevronLeft size={16} className="mr-1" />
                Geri
              </Button>
            )}
            {isButtonVisible && (
              <Button size="sm" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check size={16} className="mr-1" />
                    Bitir
                  </>
                ) : (
                  <>
                    İleri
                    <ChevronRight size={16} className="ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Arrow — points toward the highlighted element */}
        <div 
          className={`absolute ${popoverAbove ? '-bottom-2 border-b border-r' : '-top-2 border-t border-l'} left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-slate-200 rotate-45`}
        />
      </div>

      {/* Pulse Effect for Zoom steps (external to mask) */}
      {currentStatus.zoom && (
        <div 
          className="fixed pointer-events-none transition-all duration-500"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16,
            borderRadius: '20px',
            border: '3px solid #3b82f6',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            animation: 'spotlight-pulse-external 1.5s infinite'
          }}
        />
      )}

      <style>{`
        @keyframes spotlight-pulse-external {
          0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
          70% { transform: scale(1.05); opacity: 0.4; box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes spotlight-zoom-mask {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .spotlight-active {
          transform-box: fill-box;
          transform-origin: center;
          animation: spotlight-zoom-mask 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export { OnboardingTour };
