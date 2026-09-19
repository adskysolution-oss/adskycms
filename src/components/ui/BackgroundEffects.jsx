'use client';

import React from 'react';

/**
 * 3D Spherical Floating Orb inspired by modern digital agency visual references.
 * Features specular highlights, inner shadows, and soft ambient drop shadows.
 */
export function FloatingOrb({
  variant = 'peach',
  size = 40,
  animation = 'float',
  delay = '0s',
  className = '',
  blur = false,
}) {
  const variantStyles = {
    peach: {
      background: 'radial-gradient(circle at 35% 30%, #FFA885 0%, #FF6943 55%, #DE441D 100%)',
      boxShadow: '0 14px 30px -4px rgba(255, 105, 67, 0.42), inset -2px -2px 6px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.65)',
    },
    cyan: {
      background: 'radial-gradient(circle at 35% 30%, #A5F3FC 0%, #06B6D4 55%, #0284C7 100%)',
      boxShadow: '0 14px 30px -4px rgba(6, 182, 212, 0.42), inset -2px -2px 6px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.65)',
    },
    purple: {
      background: 'radial-gradient(circle at 35% 30%, #DDD6FE 0%, #8B5CF6 55%, #6D28D9 100%)',
      boxShadow: '0 14px 30px -4px rgba(139, 92, 246, 0.42), inset -2px -2px 6px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.65)',
    },
    blue: {
      background: 'radial-gradient(circle at 35% 30%, #BFDBFE 0%, #3B82F6 55%, #1D4ED8 100%)',
      boxShadow: '0 14px 30px -4px rgba(59, 130, 246, 0.42), inset -2px -2px 6px rgba(0, 0, 0, 0.2), inset 2px 2px 5px rgba(255, 255, 255, 0.65)',
    },
    ring: {
      background: 'transparent',
      border: '2.5px solid rgba(59, 130, 246, 0.35)',
      boxShadow: '0 0 16px rgba(59, 130, 246, 0.2)',
    },
    purpleRing: {
      background: 'transparent',
      border: '2.5px solid rgba(139, 92, 246, 0.35)',
      boxShadow: '0 0 16px rgba(139, 92, 246, 0.2)',
    },
  };

  const animClass =
    animation === 'float-slow'
      ? 'animate-float-slow'
      : animation === 'float-reverse'
      ? 'animate-float-reverse'
      : animation === 'pulse'
      ? 'animate-pulse-slow'
      : animation === 'none'
      ? ''
      : 'animate-float';

  const chosen = variantStyles[variant] || variantStyles.peach;

  return (
    <div
      className={`absolute rounded-full pointer-events-none select-none z-0 ${animClass} ${
        blur ? 'filter blur-[1px]' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        ...chosen,
        animationDelay: delay,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Deterministic SVG Dotted Grid Matrix.
 * Creates an elegant technical dotted background pattern.
 */
export function DottedGrid({
  cols = 5,
  rows = 5,
  spacing = 16,
  dotSize = 1.5,
  color = '#3B82F6',
  opacity = 0.25,
  className = '',
}) {
  const width = (cols - 1) * spacing + dotSize * 2;
  const height = (rows - 1) * spacing + dotSize * 2;

  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: c * spacing + dotSize,
        y: r * spacing + dotSize,
        key: `dot-${r}-${c}`,
      });
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {dots.map((d) => (
        <circle
          key={d.key}
          cx={d.x}
          cy={d.y}
          r={dotSize}
          fill={color}
          fillOpacity={opacity}
        />
      ))}
    </svg>
  );
}

/**
 * Delicate thin SVG Curved Line (waves, arcs, flowing loops).
 */
export function CurvedLine({
  variant = 'wave',
  width = 200,
  height = 80,
  color = '#3B82F6',
  opacity = 0.22,
  strokeWidth = 1.5,
  dashed = false,
  className = '',
}) {
  let pathD = '';

  if (variant === 'wave') {
    pathD = `M 0,${height * 0.5} Q ${width * 0.25},0 ${width * 0.5},${height * 0.5} T ${width},${height * 0.5}`;
  } else if (variant === 'arc') {
    pathD = `M 5,${height - 5} Q ${width * 0.5},0 ${width - 5},${height - 5}`;
  } else if (variant === 'loop') {
    pathD = `M 0,${height * 0.7} C ${width * 0.35},${height * 0.05} ${width * 0.65},${height * 0.95} ${width},${height * 0.3}`;
  } else if (variant === 's-curve') {
    pathD = `M 10,${height * 0.15} C ${width * 0.6},${height * 0.1} ${width * 0.4},${height * 0.9} ${width - 10},${height * 0.85}`;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={`pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeLinecap="round"
        strokeDasharray={dashed ? '4 4' : 'none'}
      />
    </svg>
  );
}

/**
 * Tiny geometric accents: sparkles, pluses, diamonds, rings.
 */
export function GeometricAccent({
  type = 'sparkle',
  size = 14,
  color = '#3B82F6',
  opacity = 0.3,
  animation = 'twinkle',
  delay = '0s',
  className = '',
}) {
  const animClass =
    animation === 'twinkle'
      ? 'animate-twinkle'
      : animation === 'float'
      ? 'animate-float'
      : '';

  return (
    <div
      className={`absolute pointer-events-none select-none z-0 ${animClass} ${className}`}
      style={{ width: size, height: size, animationDelay: delay }}
      aria-hidden="true"
    >
      {type === 'sparkle' && (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill={color}
          fillOpacity={opacity}
        >
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      )}

      {type === 'plus' && (
        <svg
          viewBox="0 0 16 16"
          width={size}
          height={size}
          stroke={color}
          strokeWidth="2"
          strokeOpacity={opacity}
          strokeLinecap="round"
        >
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
      )}

      {type === 'diamond' && (
        <svg
          viewBox="0 0 16 16"
          width={size}
          height={size}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity={opacity}
        >
          <rect
            x="4.5"
            y="4.5"
            width="7"
            height="7"
            transform="rotate(45 8 8)"
          />
        </svg>
      )}

      {type === 'ring' && (
        <div
          className="rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: color,
            opacity: opacity,
          }}
        />
      )}
    </div>
  );
}

/**
 * Large, ultra-soft ambient blurred gradient cloud.
 */
export function GlowBlob({
  color = 'blue',
  size = 'w-[450px] h-[450px]',
  opacity = 0.12,
  animation = 'blob',
  delay = '0s',
  className = '',
}) {
  const gradientMap = {
    blue: 'linear-gradient(135deg, #2563EB, #06B6D4)',
    purple: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    cyan: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    warm: 'linear-gradient(135deg, #FFA07A, #F59E0B)',
  };

  const chosenGrad = gradientMap[color] || gradientMap.blue;
  const animClass = animation === 'blob' ? 'animate-blob' : '';

  return (
    <div
      className={`absolute rounded-full pointer-events-none select-none z-0 filter blur-[85px] ${animClass} ${size} ${className}`}
      style={{
        background: chosenGrad,
        opacity: opacity,
        animationDelay: delay,
      }}
      aria-hidden="true"
    />
  );
}
