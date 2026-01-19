
import React from 'react';
import { SymbolId } from '../types';

interface SlotSymbolProps {
  id: SymbolId;
  className?: string;
  animated?: boolean;
}

const SlotSymbol: React.FC<SlotSymbolProps> = ({ id, className = "", animated = false }) => {
  const commonClasses = `w-full h-full drop-shadow-md ${className} ${animated ? 'filter brightness-125' : ''}`;

  // Animation utility class
  const animClass = animated ? 'animate-[spin_3s_linear_infinite]' : '';

  switch (id) {
    case 'W': // Wild - Diamond
      return (
        <svg viewBox="0 0 100 100" className={`${commonClasses}`}>
          <defs>
            <linearGradient id="wildGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g filter="url(#glow)">
            <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="url(#wildGrad)" stroke="#cffafe" strokeWidth="2" className={animated ? 'animate-pulse' : ''} />
            <path d="M15 25 L85 25 M50 5 L50 95 M15 65 L85 65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M50 5 L85 25 L50 50 L15 25 Z" fill="rgba(255,255,255,0.2)" />
            <text x="50" y="62" fontSize="18" fontWeight="900" textAnchor="middle" fill="white" style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}>WILD</text>
          </g>
        </svg>
      );
    case 'S': // Scatter - Star/Coin
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
          <g className={animated ? 'origin-center animate-[spin_2s_linear_infinite]' : ''}>
            <defs>
                <radialGradient id="starGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="#ca8a04" stroke="#fef9c3" strokeWidth="2"/>
            <circle cx="50" cy="50" r="40" fill="url(#starGrad)" />
            <path d="M50 15 L60 38 L85 41 L66 58 L72 82 L50 69 L28 82 L34 58 L15 41 L40 38 Z" fill="#fef9c3" stroke="#b45309" strokeWidth="1" />
            <text x="50" y="65" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#854d0e">SCATTER</text>
          </g>
        </svg>
      );
    case 'A': // Cherry
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
            <g className={animated ? 'origin-top animate-[swing_1s_ease-in-out_infinite]' : ''}>
                <defs>
                    <radialGradient id="cherryGrad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                </defs>
                <path d="M50 20 Q 70 5 80 40" stroke="#166534" strokeWidth="4" fill="none" />
                <path d="M50 20 Q 30 5 20 40" stroke="#166534" strokeWidth="4" fill="none" />
                <path d="M50 20 L 55 5" stroke="#166534" strokeWidth="4" />
                <circle cx="25" cy="65" r="22" fill="url(#cherryGrad)" stroke="#7f1d1d" strokeWidth="1" />
                <circle cx="75" cy="65" r="22" fill="url(#cherryGrad)" stroke="#7f1d1d" strokeWidth="1" />
                <circle cx="18" cy="58" r="5" fill="rgba(255,255,255,0.4)" />
                <circle cx="68" cy="58" r="5" fill="rgba(255,255,255,0.4)" />
            </g>
        </svg>
      );
    case 'B': // Lemon
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
            <g className={animated ? 'origin-center animate-[pulse_0.5s_ease-in-out_infinite]' : ''}>
                <defs>
                    <radialGradient id="lemonGrad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#eab308" />
                    </radialGradient>
                </defs>
                <ellipse cx="50" cy="50" rx="40" ry="32" fill="url(#lemonGrad)" stroke="#ca8a04" strokeWidth="1" />
                <path d="M10 50 Q 15 50 15 50" stroke="#ca8a04" strokeWidth="1"/>
                <path d="M90 50 Q 85 50 85 50" stroke="#ca8a04" strokeWidth="1"/>
                {/* Texture dots */}
                <circle cx="30" cy="40" r="1" fill="#ca8a04" opacity="0.5"/>
                <circle cx="50" cy="60" r="1" fill="#ca8a04" opacity="0.5"/>
                <circle cx="70" cy="45" r="1" fill="#ca8a04" opacity="0.5"/>
                <path d="M50 20 L 50 28" stroke="#166534" strokeWidth="3" />
                <path d="M50 20 Q 60 10 70 20 Q 60 25 50 20" fill="#22c55e" />
            </g>
        </svg>
      );
    case 'C': // Watermelon
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
           <g className={animated ? 'origin-bottom animate-[bounce_1s_infinite]' : ''}>
                <path d="M10 50 A 40 40 0 0 0 90 50" fill="#15803d" stroke="#14532d" strokeWidth="1" />
                <path d="M14 50 A 36 36 0 0 0 86 50" fill="#f0fdf4" />
                <path d="M18 50 A 32 32 0 0 0 82 50" fill="#ef4444" />
                <g fill="#000">
                    <ellipse cx="35" cy="65" rx="2" ry="4" transform="rotate(15 35 65)" />
                    <ellipse cx="50" cy="75" rx="2" ry="4" />
                    <ellipse cx="65" cy="65" rx="2" ry="4" transform="rotate(-15 65 65)" />
                    <ellipse cx="40" cy="55" rx="2" ry="4" transform="rotate(10 40 55)" />
                    <ellipse cx="60" cy="55" rx="2" ry="4" transform="rotate(-10 60 55)" />
                </g>
           </g>
        </svg>
      );
    case 'D': // Grapes
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
             <g className={animated ? 'origin-top animate-[swing_2s_ease-in-out_infinite]' : ''}>
                <g fill="#9333ea" stroke="#581c87" strokeWidth="1">
                    <circle cx="50" cy="85" r="10" />
                    <circle cx="40" cy="70" r="10" />
                    <circle cx="60" cy="70" r="10" />
                    <circle cx="30" cy="55" r="10" />
                    <circle cx="50" cy="55" r="10" />
                    <circle cx="70" cy="55" r="10" />
                    <circle cx="20" cy="40" r="10" />
                    <circle cx="40" cy="40" r="10" />
                    <circle cx="60" cy="40" r="10" />
                    <circle cx="80" cy="40" r="10" />
                </g>
                <path d="M50 35 L 50 20" stroke="#3f6212" strokeWidth="3" />
                <path d="M50 20 Q 30 10 20 30" fill="none" stroke="#4d7c0f" strokeWidth="2" />
                <path d="M50 20 Q 70 5 80 25 Q 60 25 50 20" fill="#65a30d" />
             </g>
        </svg>
      );
    case '10':
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
           <defs>
             <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#f3f4f6" />
               <stop offset="50%" stopColor="#9ca3af" />
               <stop offset="100%" stopColor="#4b5563" />
             </linearGradient>
           </defs>
           <text x="50" y="70" fontSize="60" fontWeight="900" textAnchor="middle" fill="url(#silverGrad)" stroke="#1f2937" strokeWidth="2" style={{ fontFamily: 'Impact, sans-serif' }} className={animated ? 'animate-pulse' : ''}>10</text>
        </svg>
      );
    case '9':
        return (
          <svg viewBox="0 0 100 100" className={commonClasses}>
             <defs>
               <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#fdba74" />
                 <stop offset="50%" stopColor="#c2410c" />
                 <stop offset="100%" stopColor="#7c2d12" />
               </linearGradient>
             </defs>
             <text x="50" y="70" fontSize="60" fontWeight="900" textAnchor="middle" fill="url(#bronzeGrad)" stroke="#431407" strokeWidth="2" style={{ fontFamily: 'Impact, sans-serif' }} className={animated ? 'animate-pulse' : ''}>9</text>
          </svg>
        );
    default:
      return null;
  }
};

export default SlotSymbol;
