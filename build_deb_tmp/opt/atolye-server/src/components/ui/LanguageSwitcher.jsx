import React, { useState, useEffect } from 'react';
import { languages } from '../../utils/i18n';

const LanguageSwitcher = ({ currentLanguage, onLanguageChange, isTourStepActive }) => {
  const [hasStartedCycle, setHasStartedCycle] = useState(false);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
  
  // Directly derive active index from prop for source of truth stability
  const activeIndex = Math.max(0, languages.findIndex(l => l.code === currentLanguage));

  // Auto-cycle logic (Tour only)
  useEffect(() => {
    let timer;
    if (isTourStepActive && !hasCompletedCycle) {
      // Step into the sequence: first transition happens after 2s, others 4s
      const delay = !hasStartedCycle ? 2000 : 4000;
      
      timer = setTimeout(() => {
        const nextIndex = (activeIndex + 1) % languages.length;
        const nextLang = languages[nextIndex].code;
        
        onLanguageChange(nextLang);

        if (nextLang !== 'tr') {
          setHasStartedCycle(true);
        } else if (hasStartedCycle && nextLang === 'tr') {
          setHasCompletedCycle(true);
          // Wait 1.5s after returning to TR before finishing tour so user sees it
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('finish-onboarding-tour'));
          }, 1500);
        }
      }, delay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isTourStepActive, activeIndex, onLanguageChange, hasStartedCycle, hasCompletedCycle]);

  // Reset internal tour states when tour step is left or re-entered
  useEffect(() => {
    if (!isTourStepActive) {
      setHasCompletedCycle(false);
      setHasStartedCycle(false);
    }
  }, [isTourStepActive]);

  const itemWidth = 44; 
  const containerPadding = 4;

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#f1f1f5',
        borderRadius: '12px',
        padding: `${containerPadding}px`,
        height: '40px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        width: `${(languages.length * itemWidth) + (containerPadding * 2)}px`
      }}
    >
      {/* Animated Sliding Background */}
      <div style={{
        position: 'absolute',
        top: `${containerPadding}px`,
        left: `${containerPadding + (activeIndex * itemWidth)}px`,
        width: `${itemWidth}px`,
        height: `${40 - (containerPadding * 2)}px`,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 1
      }} />

      {languages.map((lang, index) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          style={{
            width: `${itemWidth}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '700',
            color: activeIndex === index ? '#2463eb' : '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 2,
            letterSpacing: '0.02em'
          }}
        >
          <span style={{
            transform: activeIndex === index ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {lang.code.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
