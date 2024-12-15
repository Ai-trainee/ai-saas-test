export const cosmicTheme = {
  colors: {
    background: {
      primary: '#0a0a12',
      secondary: '#1a1a24',
      tertiary: '#141429'
    },
    accent: {
      primary: 'rgba(147, 51, 234, 1)', // 紫色
      secondary: 'rgba(59, 130, 246, 1)', // 蓝色
      tertiary: 'rgba(255, 255, 255, 1)' // 白色
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      muted: 'rgba(255, 255, 255, 0.4)'
    },
    border: {
      primary: 'rgba(147, 51, 234, 0.2)',
      secondary: 'rgba(147, 51, 234, 0.4)',
      hover: 'rgba(147, 51, 234, 0.6)'
    },
    glow: {
      primary: 'rgba(147, 51, 234, 0.3)',
      secondary: 'rgba(147, 51, 234, 0.2)',
      tertiary: 'rgba(147, 51, 234, 0.1)'
    }
  },
  gradients: {
    background: 'linear-gradient(to bottom, #0a0a12, #1a1a24)',
    accent: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))',
    text: 'linear-gradient(135deg, rgb(147, 51, 234), rgb(59, 130, 246))',
    glow: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.2), transparent 70%)'
  },
  shadows: {
    sm: '0 2px 8px rgba(147, 51, 234, 0.1)',
    md: '0 4px 20px rgba(147, 51, 234, 0.15)',
    lg: '0 8px 30px rgba(147, 51, 234, 0.2)'
  },
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(20px)'
  },
  animation: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s'
    },
    timing: {
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const

export type CosmicTheme = typeof cosmicTheme
export type CosmicColor = keyof typeof cosmicTheme.colors
export type CosmicGradient = keyof typeof cosmicTheme.gradients
export type CosmicShadow = keyof typeof cosmicTheme.shadows
export type CosmicBlur = keyof typeof cosmicTheme.blur
export type CosmicSpacing = keyof typeof cosmicTheme.spacing
export type CosmicRadius = keyof typeof cosmicTheme.borderRadius
export type CosmicFontSize = keyof typeof cosmicTheme.typography.fontSizes
export type CosmicFontWeight = keyof typeof cosmicTheme.typography.fontWeights
export type CosmicLineHeight = keyof typeof cosmicTheme.typography.lineHeights
export type CosmicBreakpoint = keyof typeof cosmicTheme.breakpoints 