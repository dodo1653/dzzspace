import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

const S: React.FC<{ children: React.ReactNode; className?: string; size?: number }> = ({ children, className, size }) =>
  React.createElement('svg', {
    viewBox: '0 0 14 14',
    className,
    width: size ?? 14,
    height: size ?? 14,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  }, children)

export const IconFocus: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M2.5 5.5v-3h3M11.5 8.5v3h-3M5.5 11.5h-3v-3M8.5 2.5h3v3" />
  </S>
)

export const IconSplit: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <rect x="1.5" y="1.5" width="11" height="11" rx="1" />
    <path d="M7 1.5v11M1.5 7h11" />
  </S>
)

export const IconClose: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M4 4l6 6M10 4l-6 6" />
  </S>
)

export const IconMinus: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M3 7h8" />
  </S>
)

export const IconPlus: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M7 3v8M3 7h8" />
  </S>
)

export const IconGrid: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <rect x="1" y="1" width="5" height="5" rx="0.5" />
    <rect x="8" y="1" width="5" height="5" rx="0.5" />
    <rect x="1" y="8" width="5" height="5" rx="0.5" />
    <rect x="8" y="8" width="5" height="5" rx="0.5" />
  </S>
)

export const IconSidebar: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <rect x="1" y="1" width="12" height="12" rx="1" />
    <path d="M5 1v12" />
  </S>
)

export const IconTrash: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M2.5 4h9M5 4V2.5a1 1 0 011-1h2a1 1 0 011 1V4M3 4l.5 7.5a1 1 0 001 1h5a1 1 0 001-1L11 4" />
  </S>
)

export const IconArrowLeft: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M9 2.5L5 7l4 4.5" />
  </S>
)

export const IconCheck: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M2.5 7.5L5.5 10.5 11.5 3.5" />
  </S>
)

export const IconRefresh: React.FC<IconProps> = ({ className, size }) => (
  <S className={className} size={size}>
    <path d="M10.5 4A4.5 4.5 0 003 6.5M3.5 10A4.5 4.5 0 0011 7.5" />
    <path d="M10.5 1.5V4H8M3.5 12.5V10H6" />
  </S>
)
